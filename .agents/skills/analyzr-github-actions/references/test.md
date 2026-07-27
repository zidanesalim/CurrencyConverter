# Test patterns

The `test` job declares `needs: build` (not `needs: lint`), so it runs in parallel with `lint` once `build` succeeds, independent of it — lint failing doesn't block test, and vice versa (same `verify`-stage independence as `analyzr-gitlab-ci`). It runs the project's test suite as `Analyzr.md` detected it (`npm test`, `pytest`, etc.), against dependencies installed the same way `build` installed them.

Whether to include a coverage summary at all is an `Interview-then-generate` question — the examples below show coverage included (the recommended default), written to `$GITHUB_STEP_SUMMARY` rather than a third-party service (ADR 0023: no external account this skill would need to provision). When the interview says no coverage, drop the coverage-related flags/steps; nothing else changes. The pattern is the same across ecosystems: run the test command through `tee` to capture its own coverage output, then a follow-up step appends that capture to `$GITHUB_STEP_SUMMARY` inside a fenced code block.

These are real-world examples, not a template — when synthesizing a `test` job for a project, draw on whichever of these are relevant to what `Analyzr.md` detected, and adapt. Don't reuse one example verbatim. Actions show a placeholder `<sha>` with the human-readable version as a trailing comment — SHA resolution happens later, as a separate synthesis step.

## Node.js, npm, Jest

A single-package Node project using `npm` and Jest.

```yaml
test:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-node@<sha>  # v4.0.2
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npm test -- --coverage --coverageReporters=text-summary | tee coverage-summary.txt
    - name: Coverage summary
      if: always()
      run: |
        {
          echo "## Coverage"
          echo '```'
          cat coverage-summary.txt
          echo '```'
        } >> "$GITHUB_STEP_SUMMARY"
```

`--coverageReporters=text-summary` is what makes Jest print a short human-readable summary to stdout instead of (or alongside) its default HTML/lcov reporters — that's the text this job captures and surfaces. `npm ci` is repeated here rather than reused from `build` because `test` is a separate job with its own runner and its own cache restore; GitHub Actions jobs don't share filesystem state across jobs unless explicitly passed via `actions/upload-artifact`/`download-artifact`. `if: always()` on the summary step means a failed test run still gets its coverage output surfaced, not just a passing one.

## Node.js, pnpm workspaces, monorepo

Runs every package's test script in a pnpm-workspaces monorepo (single job, no fan-out — ADR 0022).

```yaml
test:
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
    - run: pnpm -r test
```

Some real pipelines narrow this to only test packages affected by the change once the monorepo gets large (e.g. via `turbo`'s or `nx`'s affected-detection, or `--filter "...[origin/main]"`) — worth knowing as a variant, but the unconditional `-r test` here is the more universal starting point this skill generates.

## Python, pip, pytest

A `pytest`-based test suite with a coverage summary, for a project pinned via `requirements.txt`.

```yaml
test:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-python@<sha>  # v5.1.0
      with:
        python-version: "3.11"
        cache: pip
    - run: pip install -r requirements.txt
    - run: pytest --cov --cov-report=term | tee coverage.txt
    - name: Coverage summary
      if: always()
      run: |
        {
          echo "## Coverage"
          echo '```'
          cat coverage.txt
          echo '```'
        } >> "$GITHUB_STEP_SUMMARY"
```

`pytest-cov` (implied by `--cov`) is the de facto standard for coverage in Python test suites; `--cov-report=term` is what makes it print the per-module coverage table this job captures, instead of only writing an `.xml`/`.html` report to disk.

## Python, Poetry

Same shape as the pip/pytest example, but the test command runs through Poetry's managed virtualenv.

```yaml
test:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-python@<sha>  # v5.1.0
      with:
        python-version: "3.11"
    - uses: snok/install-poetry@<sha>  # v1.3.4
      with:
        virtualenvs-create: true
        virtualenvs-in-project: true
    - uses: actions/cache@<sha>  # v4.0.2
      with:
        path: .venv
        key: poetry-${{ hashFiles('poetry.lock') }}
    - run: poetry install --no-interaction
    - run: poetry run pytest --cov --cov-report=term | tee coverage.txt
    - name: Coverage summary
      if: always()
      run: |
        {
          echo "## Coverage"
          echo '```'
          cat coverage.txt
          echo '```'
        } >> "$GITHUB_STEP_SUMMARY"
```

`poetry run` is what routes the command through Poetry's managed virtualenv instead of the system interpreter — dropping it is a common real-world mistake that silently runs against the wrong (or missing) dependency set. The `.venv` cache key matches `build`'s exactly, so a cache hit here reuses what `build` already resolved rather than reinstalling from scratch.
