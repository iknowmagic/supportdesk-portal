#!/bin/zsh

# Technical Debt Audit Script
# Generates a markdown file with checkbox tree of src/ folder
# Excludes: src/components/ui, src/components/shadcn-studio (shadcn managed)

OUTPUT_FILE="TECHNICAL_DEBT.md"

# Function to count lines in a file
count_lines() {
    local file=$1
    if [[ -f "$file" ]]; then
        wc -l < "$file" 2>/dev/null | tr -d ' '
    else
        echo "0"
    fi
}

# Function to get line count hint
get_line_hint() {
    local lines=$1
    local is_md=$2
    
    if [[ "$is_md" == "true" ]]; then
        return
    fi
    
    if [[ $lines -le 250 ]]; then
        echo ""
    elif [[ $lines -le 600 ]]; then
        echo " ⚠️ _${lines} lines - check if needs splitting_"
    elif [[ $lines -le 1000 ]]; then
        echo " 🔴 _${lines} lines - consider refactoring_"
    else
        echo " 🚨 _${lines} lines - should be split_"
    fi
}

# Function to recursively process directory
process_directory() {
    local dir=$1
    local prefix=$2
    local depth=$3
    
    # Skip excluded directories
    if [[ "$dir" == *"/components/ui"* ]] || [[ "$dir" == *"/components/shadcn-studio"* ]]; then
        return
    fi
    
    # Get all entries (files and directories)
    local entries=($dir/*(N))
    
    for entry in $entries; do
        local item=$(basename "$entry")
        
        # Skip hidden files
        if [[ "$item" == .* ]]; then
            continue
        fi
        
        if [[ -d "$entry" ]]; then
            # Check if this is an excluded directory
            if [[ "$entry" == *"/components/ui" ]] || [[ "$entry" == *"/components/shadcn-studio" ]]; then
                echo "${prefix}- ~~${item}/~~ _(excluded: shadcn managed)_"
                continue
            fi
            
            # Directory
            echo "${prefix}- **${item}/**"
            process_directory "$entry" "${prefix}  " $((depth + 1))
        else
            # File - add checkbox with line count hint
            local line_count=$(count_lines "$entry")
            local is_md="false"
            [[ "$item" == *.md ]] && is_md="true"
            local hint=$(get_line_hint "$line_count" "$is_md")
            echo "${prefix}- [ ] \`${item}\`${hint}"
        fi
    done
}

# Generate the markdown file
cat > "$OUTPUT_FILE" << 'EOF'
# Technical Debt Audit

**Generated:** $(date +"%B %d, %Y at %H:%M")

---

## Directory Structure

Use this to see how files are organized. As you review, note if files should be reorganized.
```
EOF

# Add tree
if command -v tree >/dev/null 2>&1; then
    tree src -I 'ui|shadcn-studio|node_modules|*.png|*.jpg|*.svg' -L 4 --dirsfirst >> "$OUTPUT_FILE"
else
    find src -type d ! -path "*/ui/*" ! -path "*/shadcn-studio/*" ! -path "*/node_modules/*" | sort >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << 'EOF'
```

---

# PART 1: REVIEW PHASE

## Instructions

For each file:
1. Use `view` tool to read the file
2. Check for problems:
   - Code duplication
   - Files too large (>250 lines)
   - Poor organization (check tree above)
   - Type safety issues (any types)
   - Missing abstractions
3. Check the box `[x]`
4. Add notes if problems found:
```
   - [x] `filename.tsx`
     - ⚠️ Problem description
     - 💡 Suggested fix
```

## Excluded Directories

Skip these:
- `src/components/ui/` - shadcn managed
- `src/components/shadcn-studio/` - shadcn managed

---

## Review File Tree

EOF

# Add actual date to the file
sed -i '' "s/\$(date +\"%B %d, %Y at %H:%M\")/$(date +"%B %d, %Y at %H:%M")/g" "$OUTPUT_FILE"

# Process src directory for REVIEW section
echo "" >> "$OUTPUT_FILE"
echo "### \`src/\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Process top-level src files first
for file in src/*(N.); do
    [[ ! -f "$file" ]] && continue
    item=$(basename "$file")
    line_count=$(count_lines "$file")
    is_md="false"
    [[ "$item" == *.md ]] && is_md="true"
    hint=$(get_line_hint "$line_count" "$is_md")
    echo "- [ ] \`${item}\`${hint}" >> "$OUTPUT_FILE"
done

# Process directories
for dir in src/*(N/); do
    [[ ! -d "$dir" ]] && continue
    item=$(basename "$dir")
    
    # Skip excluded directories at top level
    if [[ "$item" == "ui" ]] || [[ "$item" == "shadcn-studio" ]]; then
        continue
    fi
    
    echo "" >> "$OUTPUT_FILE"
    echo "#### \`src/${item}/\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    process_directory "$dir" "" 0 >> "$OUTPUT_FILE"
done

# Add Review Findings section
cat >> "$OUTPUT_FILE" << 'EOF'

---

## Review Findings

Document problems found:

### Simple Fixes
- Extract function X from file Y to lib/utils.ts - used in 3 places
- Add type to parameter in file Z line N - currently any

### Complex Refactorings
- Split fileA.tsx (N lines) into smaller files - too large
- Reorganize folder X - files not logically grouped

### Patterns
- Files A, B, C duplicate logic X - extract to shared utility

---

# PART 2: ACTION PHASE

## Instructions

For each file with problems noted in Review:
1. Read the Review notes for this file
2. Implement the fixes
3. Check the box `[x]`
4. Document what was done:
```
   - [x] `filename.tsx`
     - ✅ Split into fileA.tsx and fileB.tsx
     - ✅ Reduced from 800 to 300 lines
```

---

## Action File Tree

EOF

# Process src directory again for ACTION section
echo "" >> "$OUTPUT_FILE"
echo "### \`src/\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Process top-level src files first
for file in src/*(N.); do
    [[ ! -f "$file" ]] && continue
    item=$(basename "$file")
    line_count=$(count_lines "$file")
    is_md="false"
    [[ "$item" == *.md ]] && is_md="true"
    hint=$(get_line_hint "$line_count" "$is_md")
    echo "- [ ] \`${item}\`${hint}" >> "$OUTPUT_FILE"
done

# Process directories
for dir in src/*(N/); do
    [[ ! -d "$dir" ]] && continue
    item=$(basename "$dir")
    
    # Skip excluded directories at top level
    if [[ "$item" == "ui" ]] || [[ "$item" == "shadcn-studio" ]]; then
        continue
    fi
    
    echo "" >> "$OUTPUT_FILE"
    echo "#### \`src/${item}/\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    process_directory "$dir" "" 0 >> "$OUTPUT_FILE"
done

# Add summary section
cat >> "$OUTPUT_FILE" << 'EOF'

---

## Action Summary

### Changes Made
- File X: What was done
- File Y: What was done

### Files Created
- path/to/newFile.ts - Purpose

### Files Deleted
- path/to/oldFile.ts - Reason

EOF

echo "✅ Generated: $OUTPUT_FILE"
echo ""
echo "The AI will:"
echo "  1. Review each file and note problems"
echo "  2. Check boxes as it goes"
echo "  3. Implement fixes in Action phase"