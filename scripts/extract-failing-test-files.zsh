#!/bin/zsh

# Script to extract failing test file names from pnpm test output
# Usage: ./scripts/extract-failing-test-files.zsh

# Run pnpm test and capture the output
echo "Running tests and extracting failing test file names..."
test_output=$(pnpm test 2>&1)

# Extract file paths using grep and sed
# Look for patterns like: [whitespace]FAIL  tests/api/file.test.ts > Test Description
# And: [whitespace]❯ path/to/file.test.ts:line:column
failing_files_summary=$(echo "$test_output" | grep -oE " FAIL [^>]*\.test\.(ts|tsx)" | sed 's/ FAIL //' 2>/dev/null)
failing_files_detail=$(echo "$test_output" | grep -oE "❯ [^ ]+\.test\.(ts|tsx):[0-9]+:[0-9]+" | sed 's/❯ //' | sed 's/:.*//' 2>/dev/null)

# Combine both results and handle the summary line format
failing_files_top=$(echo "$test_output" | grep -oE "❯ [^ ]+\.test\.(ts|tsx) (.*failed)" | sed 's/❯ //' | sed 's/ (.*)//' 2>/dev/null)

# Combine all results
all_failing_files=$(printf "%s\n%s\n%s" "$failing_files_summary" "$failing_files_detail" "$failing_files_top" | grep -v '^$' | sort | uniq)

echo "Failing test files:"
printf "%s\n" "$all_failing_files" | grep -v '^$'

# Exit with success status
exit 0