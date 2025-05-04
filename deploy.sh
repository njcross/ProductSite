#!/bin/bash

# Usage: ./deploy.sh "commit message" [frontend|backend|all]
# Example: ./deploy.sh "fix login bug" frontend

if [ -z "$1" ]; then
  echo "❌ Please provide a commit message."
  exit 1
fi

DEPLOY_TARGET=${2:-all}  # Default to 'all' if not specified
COMMIT_MESSAGE=$1
EC2_USER="ec2-user"
EC2_IP="3.128.30.231"
PEM_PATH="C:/Users/njcro/OneDrive/Documents/dev.pem"

# FRONTEND paths
LOCAL_FRONTEND_PATH="C:/Users/njcro/m7project/react-router-bootstrap-app"
REMOTE_REACT_PATH="/var/www/react"

# BACKEND paths
LOCAL_BACKEND_PATH="C:/Users/njcro/m7project/flask-backend"
REMOTE_BACKEND_PATH="/home/ec2-user/ProductSite/backend"

echo "✅ 1. Committing changes..."
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin main

# Deploy frontend if needed
if [[ "$DEPLOY_TARGET" == "frontend" || "$DEPLOY_TARGET" == "all" ]]; then
  echo "🎨 Deploying FRONTEND..."

  echo "📦 Building React frontend..."
  cd "$LOCAL_FRONTEND_PATH" || exit 1
  npm test -- --watchAll=false
  npm run build

  echo "🚀 Uploading React build to EC2..."
  scp -i "$PEM_PATH" -r build/* $EC2_USER@$EC2_IP:$REMOTE_REACT_PATH
  sudo ln -s /home/ec2-user/ProductSite/react-router-bootstrap-app/public/content.json /var/www/react/content.json
  sudo ln -s /home/ec2-user/ProductSite/react-router-bootstrap-app/public/images /var/www/react/images
  echo "🔧 Setting permissions and reloading Nginx..."
  ssh -i "$PEM_PATH" $EC2_USER@$EC2_IP << EOF
    sudo chmod -R 755 $REMOTE_REACT_PATH
    sudo systemctl reload nginx
EOF
fi

# Deploy backend if needed
if [[ "$DEPLOY_TARGET" == "backend" || "$DEPLOY_TARGET" == "all" ]]; then
  echo "⚙️ Deploying BACKEND..."

  echo "📤 Uploading FULL Flask backend (including venv/node_modules) to EC2..."
  cd "$LOCAL_BACKEND_PATH" || exit 1
  python3 -m venv $LOCAL_BACKEND_PATH/venv
  $LOCAL_BACKEND_PATH/venv/Scripts/activate
  pip install -r requirements.txt
  pytest
  if [ \$? -ne 0 ]; then
    echo "❌ Remote tests failed. Deployment halted."
    exit 1
  fi

  echo "🔄 Restarting backend server with PM2..."
  ssh -i "$PEM_PATH" $EC2_USER@$EC2_IP << EOF
    cd $REMOTE_BACKEND_PATH
    git add ../react-router-bootstrap-app/public/content.json
    git commit -m "$COMMIT_MESSAGE"
    git push origin main
    git stash
    git pull origin main
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pm2 delete backend || true
    pm2 start 'gunicorn "server:app" --bind 0.0.0.0:5000 --workers 4' --name backend
EOF
fi

echo "🎉 Deployment completed successfully!"
