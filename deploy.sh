#!/bin/bash

# Usage: ./deploy.sh "your commit message"

if [ -z "$1" ]; then
  echo "❌ Please provide a commit message."
  exit 1
fi

COMMIT_MESSAGE=$1
EC2_USER="ec2-user"
EC2_IP="3.128.30.231"
PEM_PATH="C:/Users/njcro/OneDrive/Documents/dev.pem"
REMOTE_REACT_PATH="/var/www/react"
LOCAL_ROOT_PATH="C:\Users\njcro\m7project"

echo "✅ 1. Committing changes..."
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main

echo "✅ 2. Building React frontend..."
cd "$LOCAL_ROOT_PATH/react-router-bootstrap-app"
npm run build

echo "✅ 3. Uploading build folder to EC2..."
scp -i "$PEM_PATH" -r build/* $EC2_USER@$EC2_IP:$REMOTE_REACT_PATH

echo "✅ 4. Setting correct permissions..."
ssh -i "$PEM_PATH" $EC2_USER@$EC2_IP << EOF
  sudo chmod -R 755 $REMOTE_REACT_PATH
  sudo chown -R nginx:nginx $REMOTE_REACT_PATH
  sudo systemctl reload nginx
EOF

echo "🚀 Deployment completed successfully!"
