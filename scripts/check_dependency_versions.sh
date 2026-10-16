#!/bin/sh
set -eu

root="${1:-.}"

if ! find "$root" -type f \( -name '*.yaml' -o -name '*.yml' \) \
  ! -name 'wippy.lock' \
  ! -path '*/.wippy/*' \
  ! -path '*/node_modules/*' \
  -print0 | sort -z | xargs -0 awk '
    function clean(value) {
      sub(/^[[:space:]]+/, "", value)
      sub(/[[:space:]]+$/, "", value)
      gsub(/^['\''"]|['\''"]$/, "", value)
      return value
    }
    function check() {
      if (!dependency) return
      value = clean(version)
      if (value == "" || value ~ /^v?[0-9]+\.[0-9]+\.[0-9]+([+-][0-9A-Za-z.-]+)?$/ || value ~ /^=v?[0-9]+\.[0-9]+\.[0-9]+/) {
        printf "%s:%d: ns.dependency %s (%s) must declare a non-exact version such as * or ^x.y.z; found %s\n", entry_file, version_line ? version_line : entry_line, name, component, value == "" ? "<missing>" : value
        bad = 1
      }
    }
    FNR == 1 {
      check()
      name = ""
      dependency = 0
      component = ""
      version = ""
      version_line = 0
    }
    /^  - name:[[:space:]]*/ {
      check()
      name = $0
      sub(/^  - name:[[:space:]]*/, "", name)
      entry_file = FILENAME
      entry_line = NR
      dependency = 0
      component = ""
      version = ""
      version_line = 0
      next
    }
    /^    kind:[[:space:]]*ns\.dependency[[:space:]]*$/ { dependency = 1; next }
    /^    component:[[:space:]]*/ {
      component = $0
      sub(/^    component:[[:space:]]*/, "", component)
      component = clean(component)
      next
    }
    /^    version:[[:space:]]*/ {
      version = $0
      sub(/^    version:[[:space:]]*/, "", version)
      version_line = NR
      next
    }
    END {
      check()
      if (bad) exit 1
    }
  '; then
  exit 1
fi

printf 'dependency version policy: PASS\n'
