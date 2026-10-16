#!/usr/bin/env bash
# Boots the harness against a mirror of the module source.
#
# Two loader behaviours force the mirror instead of replacing against "..":
#   * replacement trees are digested and refused when they change mid-boot,
#     and this workspace writes its .wippy state inside the repo;
#   * changeset expansion applies the module manifest's publish filters, so
#     exclude_meta drops every co-located meta.type=test entry before the
#     runner can discover it. The mirror is a dev-mode copy, so it drops the
#     publish-only exclude_meta block while the module keeps it.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRROR="$HERE/module-mirror"
"$HERE/prepare.sh"
cd "$HERE"
mkdir -p "$HERE/.wippy"
SQLITE_PATH="$(mktemp "$HERE/.wippy/crm-test.XXXXXX.sqlite")"
cleanup_sqlite() {
  rm -f -- "$SQLITE_PATH" "$SQLITE_PATH-wal" "$SQLITE_PATH-shm"
}
trap cleanup_sqlite EXIT
../scripts/run_wippy_test.sh "$@" --set "vars.sqlite_path=$SQLITE_PATH"
