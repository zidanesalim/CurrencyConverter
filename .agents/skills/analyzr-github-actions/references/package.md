# Package patterns (Docker build/push)

The `package` job lives in `deploy.yml`, gated by `if: github.event.workflow_run.conclusion == 'success'` (`deploy.yml`'s own `workflow_run` trigger already confirmed `ci.yml` passed on the default branch — see ADR 0017). It builds the project's Docker image and pushes it tagged immutably by `${{ github.sha }}` (never `latest` — `deploy` needs a tag that unambiguously identifies the exact commit `ci.yml` validated).

These are real-world examples, not a template — when synthesizing a `package` job, draw on whichever of these fit what `Analyzr.md` detected (Dockerfile location, registry evidence in Deployment Targets), and adapt. Don't reuse one example verbatim. Actions show a placeholder `<sha>` with the human-readable version as a trailing comment — SHA resolution happens later, as a separate synthesis step.

## GitHub Container Registry (GHCR)

The default when the project has a `Dockerfile` at its root and no other registry evidence was found — GHCR is the path of least setup, authenticated via the `GITHUB_TOKEN` GitHub already issues per run, nothing to provision.

```yaml
package:
  if: github.event.workflow_run.conclusion == 'success'
  runs-on: ubuntu-latest
  permissions:
    contents: read
    packages: write
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: docker/login-action@<sha>  # v3.1.0
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - uses: docker/build-push-action@<sha>  # v5.3.0
      with:
        context: .
        push: true
        tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

`packages: write` on this job's own `permissions:` block is what lets `GITHUB_TOKEN` push to GHCR — the workflow-level default is `contents: read` only (ADR 0020), so this job explicitly opts in to the extra scope it needs. `${{ github.repository }}` already expands to `owner/repo`, so there's no separate project-name variable to reference the way GitLab's `$CI_PROJECT_NAME` is. GHCR requires the image reference to be all-lowercase; if the repository owner or name contains uppercase characters, lowercase it explicitly (e.g. via `${{ github.repository }}` piped through a shell lowercasing step) rather than assuming it's already safe.

## External registry (Docker Hub, ECR, etc.)

Used when Deployment Targets evidence points at a registry other than GHCR (a registry hostname in a manifest/IaC file, or an existing `docker login` target).

```yaml
package:
  if: github.event.workflow_run.conclusion == 'success'
  runs-on: ubuntu-latest
  permissions:
    contents: read
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: docker/login-action@<sha>  # v3.1.0
      with:
        registry: ${{ vars.DEPLOY_REGISTRY }}
        username: ${{ secrets.DEPLOY_REGISTRY_USER }}
        password: ${{ secrets.DEPLOY_REGISTRY_PASSWORD }}
    - uses: docker/build-push-action@<sha>  # v5.3.0
      with:
        context: .
        push: true
        tags: ${{ vars.DEPLOY_REGISTRY }}/${{ github.event.repository.name }}:${{ github.sha }}
```

No `packages: write` here — that scope only affects GHCR. `$DEPLOY_REGISTRY` (a repository variable) plus `$DEPLOY_REGISTRY_USER`/`$DEPLOY_REGISTRY_PASSWORD` (repository secrets) are project-specific and proposed, not provisioned — same convention as `analyzr-gitlab-ci`'s equivalent (ADR 0013). For an OIDC-authenticated registry like Amazon ECR, skip the username/password login shown here entirely and instead assume the AWS credentials step from `references/deploy.md`'s OIDC example, then use `aws-actions/amazon-ecr-login` in its place.
