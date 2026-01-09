#!/usr/bin/env zsh

# Script to run pnpm db-dump and list public tables
# Usage: ./list-public-tables.zsh

# Ensure tmp directory exists
mkdir -p ./tmp

pnpm db-dump

if [ ! -f "./tmp/db-dump.txt" ]; then
  echo "Error: db-dump.txt was not created. Please check the pnpm db-dump command."
  exit 1
fi

# Extract and list public tables from the dump file
grep -E 'CREATE (TABLE|TYPE|MATERIALIZED VIEW)' ./tmp/db-dump.txt | \
  grep -E '"public"\.' | \
  sed -E 's/.*"public"\."([^"]+)".*/\1/' | \
  sort | uniq