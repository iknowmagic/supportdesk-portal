#!/usr/bin/env zsh
set -euo pipefail

# Usage:
#  ./scripts/run-test-suite-json.zsh               # run full test suite, JSON -> ./tmp/test-output.json
#  ./scripts/run-test-suite-json.zsh <test-file>   # run a single test file, JSON -> ./tmp/test-output.json

if [ "$#" -eq 0 ]; then
  echo "No test file specified — running full test suite and writing JSON to ./tmp/test-output.json"
  mkdir -p ./tmp
  pnpm vitest run --reporter=json > ./tmp/test-output.json
  exit $?
fi

FILE="$1"
shift || true

# Ensure tmp exists
mkdir -p ./tmp

# Run vitest for the single file (pass through any extra args)
pnpm vitest run "$FILE" --reporter=json "$@" > ./tmp/test-output.json

exit $?
