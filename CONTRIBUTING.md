# Contributing to KickSide CRM

Follow the [organization contribution guide](https://github.com/kicksideai/.github/blob/main/CONTRIBUTING.md),
[Code of Conduct](https://github.com/kicksideai/.github/blob/main/CODE_OF_CONDUCT.md), and
[CLA](https://github.com/kicksideai/.github/blob/main/CLA.md). The CLA check on your pull
request explains how to sign.

## Development and testing

Install Wippy, Node.js 22, npm, Make, and PostgreSQL client tools for the
PostgreSQL profile. From the repository root:

```sh
npm --prefix ui ci
npm --prefix ui run typecheck
npm --prefix ui run build
make lockrefresh
cd test && bash ./run.sh
```

CI runs the Lua tests against both SQLite and PostgreSQL; exercise PostgreSQL
when persistence or migrations change. Keep regenerated tracked `static/`
bundles with their `ui/` source. Run `make check-deps` when dependencies change.

### Secret scan before commit

Install the hook once per clone with [pre-commit](https://pre-commit.com):
`pre-commit install`. On each commit gitleaks scans the staged changes and
refuses a commit that carries a secret (an API key, a token, a password).
pre-commit builds gitleaks on the first commit, which takes about a minute once.

If gitleaks stops a commit, remove the secret and supply it through the
environment instead. A value that only looks like a secret, such as a test
fixture, goes into `.gitleaks.toml` as an exception for that file and that
value. A secret that already reached a commit is leaked: rotate it.

## Pull requests

Create a focused branch and submit a GitHub pull request to this repository.
Use a commit subject such as
`docs: clarify setup` or `fix: handle an empty result`. Explain the behavior and
validation in the PR; include relevant commands and outcomes. Maintainers review
and merge GitHub pull requests after the required checks and CLA confirmation.
