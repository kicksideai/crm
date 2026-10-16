#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRROR="$HERE/module-mirror"
rsync -a --delete \
  --exclude 'test/' --exclude 'postgres-test/' --exclude '.git/' \
  --exclude 'ui/node_modules/' \
  "$HERE/../" "$MIRROR/"
awk '
  /^exclude_meta:$/ { excluded = 1; next }
  excluded && ($0 ~ /^[ \t]/ || $0 ~ /^$/) { next }
  { excluded = 0; print }
' "$MIRROR/wippy.yaml" > "$MIRROR/wippy.yaml.filtered"
mv "$MIRROR/wippy.yaml.filtered" "$MIRROR/wippy.yaml"

cp "$HERE/../src/api/query.lua" "$HERE/src/query_handler_source.lua"
cp "$HERE/../src/api/resolve.lua" "$HERE/src/resolve_handler_source.lua"
