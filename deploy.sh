#!/bin/bash
# Deploy built slides to GitHub Pages (gh-pages branch)
set -e

echo "Building..."
bun run build.ts

echo "Deploying to gh-pages..."
cd dist

git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy slides $(date -u +%Y-%m-%d_%H:%M)"
git push -f https://github.com/Jackman3005/syd-claw-memory-2026-03-17.git gh-pages

cd ..
rm -rf dist/.git

echo ""
echo "✅ Deployed!"
echo ""
echo "Live at: https://jackman3005.github.io/syd-claw-memory-2026-03-17/"
echo ""
echo "Note: GitHub Pages may take 1-2 minutes to update."
