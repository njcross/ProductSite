@echo off
REM Usage: .\deploy.bat "commit message" [frontend|backend|all] [reload] [dry-run]
REM Defaults to "all" and no reload 

IF "%~1"=="" (
    echo ❌ Please provide a commit message.
    exit /b 1
)

SET COMMIT_MESSAGE=%~1
SET DEPLOY_TARGET=%~2
IF "%DEPLOY_TARGET%"=="" SET DEPLOY_TARGET=all
SET SHOULD_RELOAD=%~3
SET IS_DRY_RUN=%~4
SETLOCAL ENABLEDELAYEDEXPANSION

SET EC2_USER=ec2-user
SET EC2_IP=3.128.30.231
SET PEM_PATH=C:\Users\njcro\OneDrive\Documents\dev.pem

REM FRONTEND paths
SET LOCAL_FRONTEND_PATH=C:\Users\njcro\m7project\react-router-bootstrap-app
SET REMOTE_REACT_PATH=/var/www/react

REM BACKEND paths
SET LOCAL_BACKEND_PATH=C:\Users\njcro\m7project\backend
SET REMOTE_BACKEND_PATH=/home/ec2-user/ProductSite/backend

SET LOCAL_ROOT_PATH=C:\Users\njcro\m7project

cd "%LOCAL_ROOT_PATH%" || exit /b 1
echo Uploading restart script...
scp -i "%PEM_PATH%" restart_backend.sh %EC2_USER%@%EC2_IP%:/home/ec2-user/

echo Restarting backend on EC2...
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "chmod +x /home/ec2-user/restart_backend.sh && /home/ec2-user/restart_backend.sh"

echo ✅ 1. Committing changes...
git add .
git commit -m "%COMMIT_MESSAGE%"
git pull origin main
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Merge/rebase failed. Resolve conflicts manually before proceeding.
    exit /b 1
)
git push origin main

IF "%DEPLOY_TARGET%"=="frontend" GOTO deploy_frontend
IF "%DEPLOY_TARGET%"=="backend" GOTO deploy_backend
IF "%DEPLOY_TARGET%"=="all" GOTO deploy_all
IF "%DEPLOY_TARGET%"=="rollback" GOTO rollback_frontend

GOTO end

:deploy_frontend
echo 🎨 Deploying FRONTEND...

echo 🧪 Running frontend tests...
cd /d "%LOCAL_FRONTEND_PATH%" || exit /b 1
call npm test -- --watchAll=false > frontend_test_output.txt
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend tests failed. See summary below:
    type frontend_test_output.txt | findstr /C:"FAIL" /C:"●" /C:"expected" /C:"received" /C:"Test Suites:" /C:"Tests:"
    exit /b 1
) ELSE (
    echo ✅ Frontend tests passed.
)

echo 🔄 Syncing content.json from server...
scp -i "%PEM_PATH%" %EC2_USER%@%EC2_IP%:/home/ec2-user/ProductSite/react-router-bootstrap-app/public/content.json "%LOCAL_FRONTEND_PATH%\public\content.json"

echo 🏗️ Building the frontend...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Aborting deployment.
    exit /b 1
) ELSE (
    echo ✅ Build completed successfully.
)

echo 🚀 Uploading React build to EC2...
IF /I "%IS_DRY_RUN%"=="dry-run" (
    echo [dry-run] Would backup current build and upload new one
) ELSE (
    echo 📦 Backing up current build on EC2...
    ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "sudo rm -rf /var/www/react_backup && sudo cp -a /var/www/react /var/www/react_backup"

    echo 📤 Uploading new build...
    scp -i "%PEM_PATH%" -r build/* %EC2_USER%@%EC2_IP%:%REMOTE_REACT_PATH%

    ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "sudo chmod -R 755 %REMOTE_REACT_PATH%"
)

GOTO end

:deploy_backend
echo ⚙️ Deploying BACKEND...

call :ensure_redis

cd /d "%LOCAL_BACKEND_PATH%" || exit /b 1
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo 🧪 Running backend tests...
pytest > backend_test_output.txt
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend tests failed. See summary below:
    type backend_test_output.txt | findstr /C:"FAILED" /C:"ERROR" /C:"short test summary info"
    exit /b 1
) ELSE (
    echo ✅ Backend tests passed.
)
IF /I "%IS_DRY_RUN%"=="dry-run" (
    echo [dry-run] %*
) ELSE (
    echo Restarting backend on EC2...
    ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "cd /home/ec2-user/ProductSite/backend && source venv/bin/activate && pip install -r requirements.txt && flask db upgrade && pm2 delete backend || echo 'no backend running' && pm2 start \"gunicorn 'server:app' --bind 0.0.0.0:5000 --workers 4\" --name backend"
)

GOTO maybe_reload

:deploy_all
call :deploy_frontend
call :deploy_backend
GOTO maybe_reload

:maybe_reload
IF /I "%SHOULD_RELOAD%"=="reload" (
    echo 🔁 Reloading Nginx on EC2...
    ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "sudo systemctl reload nginx"
)
GOTO end

:rollback_frontend
echo ↩️ Rolling back frontend to previous build...

IF /I "%IS_DRY_RUN%"=="dry-run" (
    echo [dry-run] Would restart backend and ensure Redis is installed
) ELSE (
    call :ensure_redis

    echo 🔄 Restarting backend on EC2...
    ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "cd %REMOTE_BACKEND_PATH% && git stash && git pull origin main && . venv/bin/activate && pip install -r requirements.txt && flask db upgrade && pm2 delete backend || echo 'no backend running' && pm2 start 'gunicorn \"server:app\" --bind 0.0.0.0:5000 --workers 4' --name backend"
)

GOTO end

rem Temporarily disable delayed expansion so '!' is passed literally
setlocal DisableDelayedExpansion
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "bash -lc '
  if ! command -v redis-server >/dev/null; then
    echo Installing Redis from source...
    sudo dnf -y groupinstall \"Development Tools\" \
      && sudo dnf -y install gcc jemalloc-devel curl \
      && cd /tmp \
      && curl -fL https://download.redis.io/redis-stable.tar.gz -o redis-stable.tar.gz \
      && tar xzf redis-stable.tar.gz \
      && cd redis-stable \
      && make -j\"$(nproc)\" \
      && sudo make install

    id -u redis >/dev/null 2>&1 || sudo useradd -r -s /bin/false redis
    sudo mkdir -p /etc/redis /var/lib/redis
    sudo cp redis.conf /etc/redis/redis.conf
    sudo sed -i \"s/^supervised .*/supervised systemd/\" /etc/redis/redis.conf
    sudo sed -i \"s|^dir .*|dir /var/lib/redis|\" /etc/redis/redis.conf
    sudo chown -R redis:redis /var/lib/redis

    # Write systemd unit
    printf \"%s\n\" \
      \"[Unit]\" \
      \"Description=Redis In-Memory Data Store\" \
      \"After=network.target\" \
      \"\" \
      \"[Service]\" \
      \"User=redis\" \
      \"Group=redis\" \
      \"ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf\" \
      \"ExecStop=/usr/local/bin/redis-cli shutdown\" \
      \"Restart=always\" \
      \"\" \
      \"[Install]\" \
      \"WantedBy=multi-user.target\" \
      | sudo tee /etc/systemd/system/redis.service >/dev/null

    sudo systemctl daemon-reload
    sudo systemctl enable --now redis
  fi
'"
endlocal

echo 🔧 Configuring Redis keyspace notifications...
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "redis-cli CONFIG SET notify-keyspace-events Ex"
echo ▶️ Ensuring Redis listener is running via PM2...
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_IP% "pm2 delete redis-listener || echo 'No previous redis-listener'; pm2 start /home/ec2-user/ProductSite/backend/scripts/redis_listener.py --interpreter python3 --name redis-listener"
GOTO :eof

:end
echo 🎉 Deployment completed successfully!
