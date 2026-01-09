#!/bin/zsh

# Safer shadcn/ui component update script for pnpm
# Uses the new diff command to check for updates first

echo "🔍 Checking for component updates..."

# Step 1: Check what needs updating
pnpm dlx shadcn@latest diff

echo "\n📝 Showing detailed diffs for components with updates..."

# Step 2: Show detailed diff for each component (optional - you can review manually)
# Uncomment if you want to see changes automatically
# for file in src/components/ui/*.tsx; do
#   component=$(basename "$file" .tsx)
#   echo "\n--- Checking $component ---"
#   pnpm dlx shadcn@latest diff "$component" 2>/dev/null || echo "No updates for $component"
# done

echo "\n⚠️  Review the changes above. Press Enter to continue with updates, or Ctrl+C to cancel..."
read

echo "\n🔄 Updating components with --overwrite flag..."

# Step 3: Update all components
# The -o flag overwrites, -y skips confirmation
for file in src/components/ui/*.tsx; do
  component=$(basename "$file" .tsx)
  echo "Updating: $component"
  pnpm dlx shadcn@latest add "$component" -o -y
done

echo "\n✅ All shadcn/ui components updated!"