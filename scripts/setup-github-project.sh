#!/bin/bash

# FLCD Platform - GitHub Project Setup Script
# Run this script to automatically create the GitHub Project with all configurations

echo "🚀 Setting up FLCD Platform GitHub Project..."

# Step 1: Refresh GitHub CLI with project permissions
echo "📝 Step 1: Refreshing GitHub CLI permissions..."
gh auth refresh -h github.com -s project,read:project

# Step 2: Create the main project
echo "📋 Step 2: Creating GitHub Project..."
PROJECT_URL=$(gh project create \
  --title "FLCD Platform Development" \
  --owner anasabdullatheef \
  --format json | jq -r '.url')

echo "✅ Project created: $PROJECT_URL"

# Step 3: Get project ID for further configuration
PROJECT_ID=$(echo $PROJECT_URL | sed 's/.*\/projects\///')

# Step 4: Add existing issues to project
echo "📌 Step 3: Adding existing issues to project..."
for issue_num in 1 2 3 4 5 6 7; do
  gh project item-add $PROJECT_ID --owner anasabdullatheef --url "https://github.com/anasabdullatheef/flcd-platform/issues/$issue_num"
  echo "  ✅ Added issue #$issue_num"
done

echo "🎯 GitHub Project setup complete!"
echo "🔗 Project URL: $PROJECT_URL"
echo ""
echo "📋 Next steps:"
echo "1. Visit the project URL above"
echo "2. Configure custom fields (Sprint, Priority, Component, Estimate)"
echo "3. Create views (Sprint Overview, Developer Workload, Component Progress)"
echo "4. Set up automation workflows"
echo ""
echo "📖 Full setup instructions: GITHUB_PROJECTS_SETUP.md"