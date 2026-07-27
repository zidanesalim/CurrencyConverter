# Deploy patterns

The `deploy` job (or `deploy-staging`/`deploy-production` pair) lives in `deploy.yml`, `needs: package`, and declares a GitHub `environment:`. It deploys the exact image `package` pushed (`${{ github.sha }}` tag) to the single target `Analyzr.md`'s Deployment Targets evidence identified — same evidence-driven, single-target discipline as `analyzr-gitlab-ci`: a deploy job is only ever generated when that evidence points at exactly one target, zero evidence skips deploy generation (reported to the user, never guessed), and multiple conflicting targets are resolved by asking the user which one to target.

**Manual gate caveat**: `environment: name: production` alone does not pause the job. It only pauses if that GitHub Environment has "required reviewers" configured in the repository's Settings → Environments — a repository setting this skill cannot provision. Whenever the interview's gate answer is manual, this must be reported to the user at Diff-and-approve time (ADR 0024), every run, since the interview reruns fresh each invocation and the one-time repo-settings step is easy to forget.

**Cloud auth**: for a recognized cloud provider (AWS/GCP/Azure), the recommended default is OIDC federation (`permissions: id-token: write` + the provider's federated-auth action) rather than a long-lived static secret (ADR 0021) — see the AWS example below. A generic host (SSH) or PaaS (API key) target has no cloud IAM layer to federate with and keeps the static-secret shape.

These are real-world examples, not a template — synthesize a `deploy` job by adapting the example closest to the evidence found, never reusing one verbatim. Actions show a placeholder `<sha>` with the human-readable version as a trailing comment — SHA resolution happens later, as a separate synthesis step.

## AWS (ECS), OIDC federation

Used when Deployment Targets evidence points at AWS (e.g. an ECS task definition, a `terraform` AWS provider block).

```yaml
deploy:
  needs: package
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://example.com
  permissions:
    contents: read
    id-token: write
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: aws-actions/configure-aws-credentials@<sha>  # v4.0.2
      with:
        role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
        aws-region: ${{ vars.AWS_REGION }}
    - name: Deploy
      run: aws ecs update-service --cluster ${{ vars.ECS_CLUSTER }} --service ${{ vars.ECS_SERVICE }} --force-new-deployment
```

`id-token: write` is what lets this job request the short-lived OIDC token GitHub issues per run; `configure-aws-credentials` exchanges it for temporary AWS credentials scoped to `role-to-assume` — no long-lived AWS access key is ever stored as a secret. `$AWS_DEPLOY_ROLE_ARN` and `$AWS_REGION`/`$ECS_CLUSTER`/`$ECS_SERVICE` are proposed, not provisioned — and unlike a static secret, the role itself needs a trust relationship (an IAM OIDC identity provider trusting this repo/branch) configured on the AWS side, which this skill can only name, never create.

## Kubernetes, kubectl image update

Used when Deployment Targets evidence includes a Kubernetes manifest (e.g. `k8s/deployment.yaml`) referencing a Deployment/container this job can target, and the cluster is reached via a static kubeconfig rather than cloud-provider OIDC (e.g. a self-hosted cluster).

```yaml
deploy:
  needs: package
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://example.com
  permissions:
    contents: read
  steps:
    - name: Configure kubeconfig
      run: |
        mkdir -p ~/.kube
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > ~/.kube/config
    - name: Deploy
      run: |
        kubectl set image deployment/app app=ghcr.io/${{ github.repository }}:${{ github.sha }} -n ${{ vars.KUBE_NAMESPACE }}
        kubectl rollout status deployment/app -n ${{ vars.KUBE_NAMESPACE }}
```

`$KUBE_CONFIG` (base64-encoded, stored as a repository secret) and `$KUBE_NAMESPACE` are proposed, not provisioned. `rollout status` is what turns a fire-and-forget `kubectl set image` into a job that actually fails when the rollout fails, instead of reporting success the instant the API call is accepted. If the cluster is itself cloud-managed (EKS/GKE), prefer that provider's OIDC action to obtain cluster credentials instead of a static `KUBE_CONFIG` secret, same reasoning as the AWS ECS example above.

## Generic host, SSH + Docker

Used when Deployment Targets evidence points at a single remote host (e.g. a `docker-compose.yml` plus deploy notes/IaC referencing a server) rather than an orchestrator.

```yaml
deploy:
  needs: package
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://example.com
  permissions:
    contents: read
  steps:
    - name: Deploy over SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/id_ed25519
        chmod 600 ~/.ssh/id_ed25519
        ssh-keyscan ${{ vars.DEPLOY_HOST }} >> ~/.ssh/known_hosts
        ssh ${{ vars.DEPLOY_USER }}@${{ vars.DEPLOY_HOST }} "docker pull ghcr.io/${{ github.repository }}:${{ github.sha }} && docker compose up -d"
```

`$DEPLOY_SSH_KEY`, `$DEPLOY_HOST`, and `$DEPLOY_USER` are proposed, not provisioned. `ssh-keyscan` into `known_hosts` avoids an interactive host-key prompt hanging the job — a bare `ssh` without it fails non-interactively in CI.

## PaaS, git-based deploy

Used when Deployment Targets evidence is a PaaS config file (e.g. a `Procfile`, `app.json`, or platform-specific manifest) rather than container orchestration.

```yaml
deploy:
  needs: package
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://example.com
  permissions:
    contents: read
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
      with:
        fetch-depth: 0
    - name: Deploy
      run: git push https://heroku:${{ secrets.DEPLOY_API_KEY }}@git.heroku.com/${{ vars.DEPLOY_APP_NAME }}.git ${{ github.sha }}:refs/heads/main --force
```

`fetch-depth: 0` overrides `checkout`'s default shallow clone (depth 1) — pushing an arbitrary commit SHA to a remote requires that commit's full object history to be present locally, which a shallow clone won't have. `$DEPLOY_API_KEY` and `$DEPLOY_APP_NAME` are proposed, not provisioned. Pushing `github.sha` (not the branch name) as the ref is what ties this deploy to the exact commit `ci.yml` and `package` validated, consistent with every other job's immutable-reference discipline.

## Staging → production (when the interview picks two environments)

Used when the interview answer to "how many environments?" is staging→production rather than single-environment. Same target shape as whichever single-environment example above matches the evidence — this one adapts the AWS ECS/OIDC example — split into two jobs: `deploy-staging` always deploys automatically once `package` succeeds (non-negotiable), `deploy-production` keeps whatever gate the interview chose for production (manual shown here, the recommended default — see the manual-gate caveat above). Both target the same cloud/cluster shape but read environment-prefixed variables and assume separate, environment-scoped IAM roles, never a shared credential.

```yaml
deploy-staging:
  needs: package
  runs-on: ubuntu-latest
  environment:
    name: staging
    url: https://staging.example.com
  permissions:
    contents: read
    id-token: write
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: aws-actions/configure-aws-credentials@<sha>  # v4.0.2
      with:
        role-to-assume: ${{ vars.STAGING_AWS_DEPLOY_ROLE_ARN }}
        aws-region: ${{ vars.STAGING_AWS_REGION }}
    - name: Deploy
      run: aws ecs update-service --cluster ${{ vars.STAGING_ECS_CLUSTER }} --service ${{ vars.STAGING_ECS_SERVICE }} --force-new-deployment

deploy-production:
  needs: deploy-staging
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://example.com
  permissions:
    contents: read
    id-token: write
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: aws-actions/configure-aws-credentials@<sha>  # v4.0.2
      with:
        role-to-assume: ${{ vars.PROD_AWS_DEPLOY_ROLE_ARN }}
        aws-region: ${{ vars.PROD_AWS_REGION }}
    - name: Deploy
      run: aws ecs update-service --cluster ${{ vars.PROD_ECS_CLUSTER }} --service ${{ vars.PROD_ECS_SERVICE }} --force-new-deployment
```

`needs: deploy-staging` on `deploy-production` is what turns "two jobs" into an actual promotion flow — without it, GitHub Actions would offer `deploy-production` the moment `package` succeeds, in parallel with staging, defeating the point of validating on staging first (same role GitLab's `needs: [deploy-staging]` plays). `$STAGING_AWS_DEPLOY_ROLE_ARN`/`$STAGING_*` and `$PROD_AWS_DEPLOY_ROLE_ARN`/`$PROD_*` are two entirely separate role/variable sets — never one pair reused across environments.
