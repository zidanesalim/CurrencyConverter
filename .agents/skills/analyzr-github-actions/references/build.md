# Build patterns

The `build` job is the gating prerequisite of `ci.yml` — `test`/`lint` declare `needs: build` and only run once it succeeds (a project that doesn't build shouldn't waste pipeline time being tested or linted). What "build" means depends on the ecosystem: for a bundled/compiled language it's an actual compile or bundle step; for an interpreted language with no bundling it can just mean "install dependencies and confirm the project is importable/installable."

These are real-world examples, not a template — when synthesizing a `build` job for a project, draw on whichever of these are relevant to what `Analyzr.md` detected (package manager, lockfile, language), and adapt. Don't reuse one example verbatim. Actions below show a placeholder `<sha>` with the human-readable version as a trailing comment — SHA resolution happens later, as a separate synthesis step (ADR 0019), not maintained by hand here.

## Node.js, npm, TypeScript bundle

A single-package Node project using `npm` (lockfile: `package-lock.json`) that compiles TypeScript to `dist/` via a `build` script.

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-node@<sha>  # v4.0.2
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npm run build
    - uses: actions/upload-artifact@<sha>  # v4.3.1
      with:
        name: dist
        path: dist/
        retention-days: 1
```

`npm ci` (not `npm install`) is the production-grade choice here — it installs exactly what the lockfile specifies and fails if `package.json`/`package-lock.json` are out of sync, instead of silently updating the lockfile. `setup-node`'s `cache: npm` input restores/saves the npm cache keyed to `package-lock.json` automatically — unlike GitLab's `cache:` block, there's no separate cache step to write by hand. `upload-artifact` hands the compiled output to any later job that needs it (not used in `ci.yml`'s build → test/lint shape, but common once a project also builds a non-Docker deployable in `deploy.yml`).

## Node.js, pnpm workspaces, monorepo

A pnpm-workspaces monorepo (lockfile: `pnpm-lock.yaml`) that builds every package in the workspace as a single job (see ADR 0022 — no per-package fan-out).

```yaml
build:
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
    - run: pnpm -r build
```

`pnpm/action-setup` installs pnpm itself onto the runner — `setup-node`'s `cache: pnpm` detection needs pnpm already on `PATH` to locate its store, so this step must come first, same role `corepack` plays in the GitLab equivalent. `--frozen-lockfile` is pnpm's equivalent of `npm ci`: fail instead of drifting from the lockfile. `-r` runs the script across every workspace package.

## Python, pip, requirements.txt

A single-package Python project pinned via `requirements.txt`, with no separate compiled build artifact — "build" here means proving the dependency set installs cleanly.

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@<sha>  # v4.1.1
    - uses: actions/setup-python@<sha>  # v5.1.0
      with:
        python-version: "3.11"
        cache: pip
    - run: pip install -r requirements.txt
```

No `venv` is created here — on an isolated runner, installing into the system interpreter is the common real-world shortcut (there's nothing else sharing that interpreter). `setup-python`'s `cache: pip` input keys the pip cache to `requirements.txt` automatically, same convenience as `setup-node`'s `cache: npm`.

## Python, Poetry

A Poetry-managed project (lockfile: `poetry.lock`) that also builds a distributable artifact (wheel/sdist).

```yaml
build:
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
    - run: poetry build
```

There's no official `actions/setup-poetry` — `snok/install-poetry` is the de facto real-world choice for installing Poetry itself. `setup-python`'s built-in `cache:` input doesn't understand a project-local Poetry virtualenv, so the resolved `.venv` is cached explicitly via `actions/cache`, keyed on `poetry.lock`'s hash. `poetry install` alone only proves dependencies resolve; `poetry build` is what actually exercises packaging, which is the meaningful "build" signal for a library-shaped Python project (as opposed to an application, where `poetry install` alone is often enough).
