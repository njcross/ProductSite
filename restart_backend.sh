#!/bin/bash

cd /home/ec2-user/ProductSite
CONTENT_PATH="react-router-bootstrap-app/public/content.json"

echo "Inspecting content.json status..."
if [ -f "$CONTENT_PATH" ]; then
    echo "Found content.json"
    if [ -n "$(git status --porcelain "$CONTENT_PATH")" ]; then
        echo "Committing local content.json changes before pulling..."
        git add "$CONTENT_PATH"
        git config user.name "Auto Deploy"
        git config user.email "deploy@myplaytray.com"
        git commit -m "Auto-commit: Preserve local content.json before pull" || true
    else
        echo "No content.json changes to commit."
    fi
else
    echo "content.json not found at $CONTENT_PATH"
    ls -la "$(dirname "$CONTENT_PATH")"
fi

git pull origin main

if [ -n "$(git status --porcelain "$CONTENT_PATH")" ]; then
    echo "Pushing merged content.json changes..."
    git add "$CONTENT_PATH"
    git commit -m "Auto-merge: Update content.json after pull"
    git push origin main || true
else
    echo "No changes to push for content.json."
fi

cd /home/ec2-user/ProductSite/backend
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
pm2 delete backend || echo "no backend running"
pm2 start "gunicorn 'server:app' --bind 0.0.0.0:5000 --workers 4" --name backend
