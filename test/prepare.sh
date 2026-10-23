#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRROR="$HERE/module-mirror"
# The test runner image intentionally contains the Wippy CLI and basic POSIX
# tooling, but not rsync.  Rebuild the disposable mirror with tar instead:
# this preserves modes, symlinks and dotfiles while applying the same source
# exclusions as the previous rsync invocation.
rm -rf -- "$MIRROR"
mkdir -p "$MIRROR"
tar -C "$HERE/.." \
  --exclude='./test' --exclude='./postgres-test' --exclude='./.git' \
  --exclude='./ui/node_modules' \
  -cf - . | tar -C "$MIRROR" -xf -
awk '
  /^exclude_meta:$/ { excluded = 1; next }
  excluded && ($0 ~ /^[ \t]/ || $0 ~ /^$/) { next }
  { excluded = 0; print }
' "$MIRROR/wippy.yaml" > "$MIRROR/wippy.yaml.filtered"
mv "$MIRROR/wippy.yaml.filtered" "$MIRROR/wippy.yaml"

cp "$HERE/../src/api/query.lua" "$HERE/src/query_handler_source.lua"
cp "$HERE/../src/api/resolve.lua" "$HERE/src/resolve_handler_source.lua"
