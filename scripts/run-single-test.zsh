#!/usr/bin/env zsh
# Script to run a single test file with a specific test name using vitest
# Usage: ./run-test.zsh <test-file> <test-name>
# Example: ./run-test.zsh user-isolation.test.ts "User A cannot UPDATE"

if [ $# -ne 2 ]; then
  echo "Usage: $0 <test-file> <test-name>"
  echo "Example: $0 user-isolation.test.ts \"User A cannot UPDATE\""
  exit 1
fi

TEST_FILE=$1
TEST_NAME=$2

echo "Running test file: $TEST_FILE"
echo "With test name pattern: $TEST_NAME"

pnpm vitest run "$TEST_FILE" -t "$TEST_NAME"