#!/bin/bash

# Script to remove all comments from TypeScript and TSX files in src folder
# Usage: ./remove_comments.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Starting comment removal from TypeScript/TSX files in src folder...${NC}"

# Check if src folder exists
if [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: src folder not found in current directory${NC}"
    exit 1
fi

# Create backup folder
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}📁 Creating backup in $BACKUP_DIR...${NC}"
mkdir -p "$BACKUP_DIR"

# Counter for processed files
processed_files=0

# Function to remove comments from a file
remove_comments() {
    local file="$1"
    local backup_file="$BACKUP_DIR/$file"
    
    # Create backup directory structure
    mkdir -p "$(dirname "$backup_file")"
    
    # Create backup
    cp "$file" "$backup_file"
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Process the file to remove comments
    # This sed script removes:
    # 1. Single line comments (//.*)
    # 2. Multi-line comments (/* ... */)
    # 3. JSDoc comments (/** ... */)
    sed '
        # Remove single line comments but preserve URLs and regex patterns
        s|//[^"'\'']*$||g
        
        # Handle multi-line comments
        :start
        /\/\*/{
            :loop
            /\*\//!{
                N
                b loop
            }
            s|/\*.*\*/||g
            b start
        }
        
        # Remove empty lines that were created by comment removal
        /^[[:space:]]*$/d
    ' "$file" > "$temp_file"
    
    # Replace original file with processed content
    mv "$temp_file" "$file"
    
    echo -e "${GREEN}✅ Processed: $file${NC}"
    ((processed_files++))
}

# Find and process all .ts and .tsx files in src folder
echo -e "${YELLOW}🔍 Searching for TypeScript/TSX files...${NC}"

while IFS= read -r -d '' file; do
    remove_comments "$file"
done < <(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)

echo -e "${GREEN}🎉 Comment removal completed!${NC}"
echo -e "${GREEN}📊 Processed $processed_files files${NC}"
echo -e "${YELLOW}💾 Backup created in: $BACKUP_DIR${NC}"
echo -e "${YELLOW}⚠️  Please review the changes before committing${NC}"

# Optional: Show summary of changes
echo -e "${YELLOW}📋 Summary of changes:${NC}"
echo "Original files backed up to: $BACKUP_DIR"
echo "Comments removed from $processed_files TypeScript/TSX files"

# Optional: Ask if user wants to see a diff
read -p "Do you want to see a diff of changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📊 Showing differences (first 5 files only):${NC}"
    count=0
    for original in $(find "$BACKUP_DIR/src" -type f \( -name "*.ts" -o -name "*.tsx" \) | head -5); do
        current_file="${original#$BACKUP_DIR/}"
        echo -e "\n${YELLOW}=== $current_file ===${NC}"
        diff -u "$original" "$current_file" | head -20
        ((count++))
    done
    
    if [ $processed_files -gt 5 ]; then
        echo -e "\n${YELLOW}... and $((processed_files - 5)) more files${NC}"
    fi
fi

echo -e "${GREEN}✨ Done! Remember to test your application after removing comments.${NC}"
