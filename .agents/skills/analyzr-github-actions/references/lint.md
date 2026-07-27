# Lint patterns

The `lint` job declares `needs: build` (not `needs: test`), so it runs in parallel with `test` once `build` succeeds — lint doesn't gate test, or vice versa. It runs the project's static-analysis/style checks as `Analyzr.md` detected them.

Whether a lint failure blocks the pipeline (the recommended default, shown below with no extra field needed — a failing step fails the job by default) or is advisory-only is an `Interview-then-generate` question — a team partway through adopting a new linter often wants advisory-only. When the interview picks advisory, add `continue-on-error: true` to the job (GitHub Actions' equivalent of GitLab's `allow_failure: true`); nothing else about the examples below changes.

These are real-world examples, not a template — when synthesizing a `lint` job for a project, draw on whichever of these are relevant to what `Analyzr.md` detected, and adapt. Don't reuse one example verbatim. Actions show a placeholder `<sha>` with the human-readable version as a trailing comment — SHA resolution happens later, as a separate synthesis step.

## Node.js, npm, ESLint

A single-package Node project using `npm` and ESLint via a `lint` script.

```yaml
lint:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-node@<sha>  # v4.0.2
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npm run lint
```

Nothing exotic here — most real npm projects already define a `lint` script wrapping ESLint (and often Prettier's `--check` mode alongside it), so the job just needs to install dependencies and invoke it. Some pipelines add `--max-warnings=0` to the underlying ESLint invocation to stop warnings from silently accumulating; worth using when the project's own `lint` script doesn't already enforce it.

## Node.js, pnpm workspaces, monorepo

Runs every package's lint script in a pnpm-workspaces monorepo (single job, no fan-out — ADR 0022).

```yaml
lint:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: pnpm/action-setup@<sha>  # v4.0.0
      with:
        version: 9
    - uses: actions/setup-node@<sha>  # v4.0.2
      with:
        node-version: 20
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm -r lint
```

Same install shape as the pnpm `build`/`test` examples — only the final command differs. This repetition across build/test/lint jobs for the same ecosystem is normal and expected; each GitHub Actions job is its own runner with its own filesystem, so there's no way to "install once" and share it across jobs without `upload-artifact`/`download-artifact` or a shared cache key doing that work.

## Python, Ruff

Ruff is the fast, increasingly-default choice for Python linting in new projects (it typically subsumes what flake8 + isort used to cover separately).

```yaml
lint:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-python@<sha>  # v5.1.0
      with:
        python-version: "3.11"
        cache: pip
    - run: pip install ruff
    - run: ruff check .
```

Ruff has no project dependencies of its own to speak of, so this job doesn't need the full `requirements.txt` install that `build`/`test` do — installing just `ruff` itself is enough and keeps the job fast. If the project pins Ruff's version in `requirements.txt` or `pyproject.toml`, install from there instead of a bare `pip install ruff` so CI lints with the same version contributors run locally.

## Python, flake8

Older/legacy convention, still common enough in existing production pipelines to be a real pattern worth having, even as Ruff adoption grows.

```yaml
lint:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-python@<sha>  # v5.1.0
      with:
        python-version: "3.11"
        cache: pip
    - run: pip install flake8
    - run: flake8 .
```

Same shape as the Ruff example, swapping the tool. If a project's `requirements.txt`/`requirements-dev.txt` already lists `flake8` (common, since it's often paired with a local pre-commit hook), install from that file instead of a bare `pip install flake8` for version consistency with local dev.
