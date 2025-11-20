#!/bin/bash
# Fix Next.js 15 params (now Promises) in all route files

# Find all route files and fix them
find src/app/api -name "*.ts" -type f | while read file; do
  # Check if file has params
  if grep -q "{ params }" "$file"; then
    echo "Fixing $file"

    # Fix param types - make them Promise wrapped
    sed -i 's/{ params }: { params: { \([^}]*\) } }/{ params }: { params: Promise<{ \1 }> }/g' "$file"

    # Fix param usage - await the params
    sed -i 's/const { \([^}]*\) } = params/const { \1 } = await params/g' "$file"
  fi
done
