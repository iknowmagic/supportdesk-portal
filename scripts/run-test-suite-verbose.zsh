#!/usr/bin/env zsh
set -euo pipefail

# Usage:
#  ./scripts/run-test-suite-verbose.zsh               # run full test suite, verbose -> ./tmp/test-output-verbose.txt
#  ./scripts/run-test-suite-verbose.zsh <test-file>   # run a single test file, verbose -> ./tmp/test-output-verbose.txt

if [ "$#" -eq 0 ]; then
  echo "No test file specified — running full test suite and writing verbose output to ./tmp/test-output-verbose.txt"
  mkdir -p ./tmp
  pnpm vitest run --no-color --reporter=verbose &> ./tmp/test-output-verbose.txt
  exit $?
fi

FILE="$1"
shift || true

# Ensure tmp exists
mkdir -p ./tmp

# Run vitest for the single file (pass through any extra args)
pnpm vitest run "$FILE" --no-color --reporter=verbose "$@" &> ./tmp/test-output-verbose.txt

exit $?
