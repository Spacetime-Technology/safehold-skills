#!/bin/bash
# Smoke-test the install round-trip against a temp HOME.
set -e

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
tmphome="$(mktemp -d)"
trap 'rm -rf "$tmphome"' EXIT

echo "→ packing"
cd "$repo_root"
tgz="$(npm pack --silent)"

echo "→ installing into $tmphome"
HOME="$tmphome" node "$repo_root/bin/install.js" install

echo "→ checking files"
for f in SKILL.md airlines.md; do
  path="$tmphome/.claude/skills/airline-check-in/$f"
  [ -f "$path" ] || { echo "MISSING: $path"; exit 1; }
  echo "  ✓ $f"
done

echo "→ listing"
HOME="$tmphome" node "$repo_root/bin/install.js" list

echo "→ uninstalling"
HOME="$tmphome" node "$repo_root/bin/install.js" uninstall airline-check-in
[ -d "$tmphome/.claude/skills/airline-check-in" ] && { echo "uninstall left dir behind"; exit 1; }

echo "→ refuse-on-conflict"
HOME="$tmphome" node "$repo_root/bin/install.js" install
if HOME="$tmphome" node "$repo_root/bin/install.js" install 2>/dev/null; then
  echo "expected refuse-on-conflict to exit non-zero"; exit 1
fi
echo "  ✓ refused without --force"

HOME="$tmphome" node "$repo_root/bin/install.js" install --force >/dev/null
echo "  ✓ overwrote with --force"

rm -f "$repo_root/$tgz"
echo "OK"
