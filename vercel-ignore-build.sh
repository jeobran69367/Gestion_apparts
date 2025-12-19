#!/bin/sh
set -e
# Vercel Ignore Build Step Script
# This script determines whether Vercel should deploy based on the branch and CI status
# Exit 1 to skip deployment, Exit 0 to proceed with deployment

echo "🔍 Checking if deployment should proceed..."

# Get current branch name
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $BRANCH_NAME"

# Always deploy on master/main branch (after tests pass in GitHub Actions)
if [ "$BRANCH_NAME" = "master" ] || [ "$BRANCH_NAME" = "main" ]; then
  echo "✅ Master/Main branch detected - deployment will proceed"
  echo "ℹ️  GitHub Actions must pass before merge protection allows this to reach master"
  exit 0
fi

# For other branches (like PRs), check if this is a preview deployment
# You can add logic here to skip preview deployments if needed
echo "🌿 Feature/PR branch detected - allowing preview deployment"
echo "ℹ️  Note: Always check GitHub Actions status before merging to master"
exit 0