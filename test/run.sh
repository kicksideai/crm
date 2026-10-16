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
"$HERE/prepare.sh"
cd "$HERE"
mkdir -p "$HERE/.wippy"
SQLITE_PATH="$(mktemp "$HERE/.wippy/crm-test.XXXXXX.sqlite")"
OUTPUT="$(mktemp "$HERE/.wippy/crm-suite.XXXXXX.log")"
cleanup_sqlite() {
  rm -f -- "$SQLITE_PATH" "$SQLITE_PATH-wal" "$SQLITE_PATH-shm" "$OUTPUT"
}
trap cleanup_sqlite EXIT
set +e
wippy test "$@" --set "vars.sqlite_path=$SQLITE_PATH" 2>&1 | tee "$OUTPUT"
status=${PIPESTATUS[0]}
set -e

if [ "$status" -ne 0 ] || grep -q 'FAILED' "$OUTPUT" || ! grep -q 'PASSED' "$OUTPUT"; then
  echo "wippy test did not report a passing suite" >&2
  exit 1
fi
