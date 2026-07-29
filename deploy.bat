@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul 2>&1

set "DEPLOY_SCRIPT_VERSION=2026-07-29-v4"
echo ProductSite deploy script %DEPLOY_SCRIPT_VERSION%
echo.

REM ============================================================================
REM ProductSite deployment script
REM
REM Usage:
REM   deploy.bat "commit message" [target] [nginx-action] [dry-run]
REM
REM Examples:
REM   deploy.bat "Deploy frontend" frontend
REM   deploy.bat "Deploy backend" backend reload
REM   deploy.bat "Deploy everything" all renew-cert
REM   deploy.bat "Validate everything" all dry-run
REM   deploy.bat "Rollback frontend" rollback
REM
REM A dry run installs local dependencies and runs tests/builds, but it does not:
REM   - pull, commit, or push Git changes
REM   - copy content.json from EC2
REM   - modify EC2
REM ============================================================================

if "%~1"=="" (
    echo ERROR: Please provide a commit message.
    echo Usage: deploy.bat "commit message" [frontend^|backend^|all^|rollback] [reload^|renew-cert] [dry-run]
    exit /b 1
)

set "COMMIT_MESSAGE=%~1"
set "DEPLOY_TARGET=%~2"
if not defined DEPLOY_TARGET set "DEPLOY_TARGET=all"

set "SHOULD_RELOAD=%~3"
set "IS_DRY_RUN=%~4"

REM PowerShell may omit an empty third argument. Accept dry-run as either
REM the third or fourth argument:
REM   .\deploy.bat "Validate deployment" all dry-run
if /I "%SHOULD_RELOAD%"=="dry-run" (
    set "IS_DRY_RUN=dry-run"
    set "SHOULD_RELOAD="
)

REM "none" may be used as an explicit third-argument placeholder:
REM   .\deploy.bat "Validate deployment" all none dry-run
if /I "%SHOULD_RELOAD%"=="none" set "SHOULD_RELOAD="

set "EC2_USER=ec2-user"
set "EC2_IP=3.128.30.231"
set "PEM_PATH=C:\Users\njcro\OneDrive\Documents\dev.pem"

set "LOCAL_ROOT_PATH=C:\Users\njcro\ProductSite"
set "LOCAL_FRONTEND_PATH=%LOCAL_ROOT_PATH%\react-router-bootstrap-app"
set "LOCAL_BACKEND_PATH=%LOCAL_ROOT_PATH%\backend"

set "REMOTE_ROOT_PATH=/home/ec2-user/ProductSite"
set "REMOTE_BACKEND_PATH=%REMOTE_ROOT_PATH%/backend"
set "REMOTE_CONTENT_PATH=%REMOTE_ROOT_PATH%/react-router-bootstrap-app/public/content.json"
set "REMOTE_REACT_PATH=/var/www/react"
set "REMOTE_REACT_BACKUP_PATH=/var/www/react_backup"
set "REMOTE_UPLOAD_PATH=/home/ec2-user/react_build_upload"

set "DO_FRONTEND=0"
set "DO_BACKEND=0"

call :validate_arguments
if errorlevel 1 goto :fail

if /I "%DEPLOY_TARGET%"=="frontend" set "DO_FRONTEND=1"
if /I "%DEPLOY_TARGET%"=="backend" set "DO_BACKEND=1"
if /I "%DEPLOY_TARGET%"=="all" (
    set "DO_FRONTEND=1"
    set "DO_BACKEND=1"
)

call :validate_environment
if errorlevel 1 goto :fail

if /I "%DEPLOY_TARGET%"=="rollback" (
    call :rollback_frontend
    if errorlevel 1 goto :fail
    goto :success
)

if /I "%IS_DRY_RUN%"=="dry-run" (
    echo [dry-run] Git pull, commit, and push will be skipped.
) else (
    call :prepare_git
    if errorlevel 1 goto :fail
)

if "%DO_FRONTEND%"=="1" (
    call :sync_content_from_server
    if errorlevel 1 goto :fail

    call :test_and_build_frontend
    if errorlevel 1 goto :fail
)

if "%DO_BACKEND%"=="1" (
    call :test_backend
    if errorlevel 1 goto :fail
)

call :commit_and_push
if errorlevel 1 goto :fail

if "%DO_FRONTEND%"=="1" (
    call :deploy_frontend_remote
    if errorlevel 1 goto :fail
)

if "%DO_BACKEND%"=="1" (
    call :deploy_backend_remote
    if errorlevel 1 goto :fail
)

call :handle_nginx_action
if errorlevel 1 goto :fail

goto :success


REM ============================================================================
REM Validation
REM ============================================================================

:validate_arguments
if /I "%DEPLOY_TARGET%"=="frontend" goto :target_ok
if /I "%DEPLOY_TARGET%"=="backend" goto :target_ok
if /I "%DEPLOY_TARGET%"=="all" goto :target_ok
if /I "%DEPLOY_TARGET%"=="rollback" goto :target_ok

echo ERROR: Invalid deployment target "%DEPLOY_TARGET%".
echo Allowed targets: frontend, backend, all, rollback
exit /b 1

:target_ok
if not defined SHOULD_RELOAD goto :reload_ok
if /I "%SHOULD_RELOAD%"=="reload" goto :reload_ok
if /I "%SHOULD_RELOAD%"=="renew-cert" goto :reload_ok

echo ERROR: Invalid Nginx action "%SHOULD_RELOAD%".
echo Allowed actions: reload, renew-cert, dry-run, none, or leave it blank
exit /b 1

:reload_ok
if not defined IS_DRY_RUN exit /b 0
if /I "%IS_DRY_RUN%"=="dry-run" exit /b 0

echo ERROR: Invalid fourth argument "%IS_DRY_RUN%".
echo The fourth argument must be dry-run or left blank.
exit /b 1


:validate_environment
if not exist "%LOCAL_ROOT_PATH%\" (
    echo ERROR: Local repository was not found:
    echo   %LOCAL_ROOT_PATH%
    exit /b 1
)

if not exist "%LOCAL_ROOT_PATH%\.git\" (
    echo ERROR: "%LOCAL_ROOT_PATH%" is not a Git repository.
    exit /b 1
)

if "%DO_FRONTEND%"=="1" (
    if not exist "%LOCAL_FRONTEND_PATH%\package.json" (
        echo ERROR: Frontend package.json was not found:
        echo   %LOCAL_FRONTEND_PATH%\package.json
        exit /b 1
    )

    where npm >nul 2>&1
    if errorlevel 1 (
        echo ERROR: npm was not found on PATH.
        exit /b 1
    )
)

if "%DO_BACKEND%"=="1" (
    if not exist "%LOCAL_BACKEND_PATH%\requirements.txt" (
        echo ERROR: Backend requirements.txt was not found:
        echo   %LOCAL_BACKEND_PATH%\requirements.txt
        exit /b 1
    )

    where python >nul 2>&1
    if errorlevel 1 (
        echo ERROR: python was not found on PATH.
        exit /b 1
    )
)

if /I "%IS_DRY_RUN%"=="dry-run" exit /b 0

where git >nul 2>&1
if errorlevel 1 (
    echo ERROR: git was not found on PATH.
    exit /b 1
)

where ssh >nul 2>&1
if errorlevel 1 (
    echo ERROR: ssh was not found on PATH.
    exit /b 1
)

if "%DO_FRONTEND%"=="1" (
    where scp >nul 2>&1
    if errorlevel 1 (
        echo ERROR: scp was not found on PATH.
        exit /b 1
    )
)

if not exist "%PEM_PATH%" (
    echo ERROR: EC2 private key was not found:
    echo   %PEM_PATH%
    exit /b 1
)

exit /b 0


REM ============================================================================
REM Git preparation and publishing
REM ============================================================================

:prepare_git
echo.
echo [1/7] Updating the local main branch before testing...
pushd "%LOCAL_ROOT_PATH%"
if errorlevel 1 (
    echo ERROR: Could not enter "%LOCAL_ROOT_PATH%".
    exit /b 1
)

set "CURRENT_BRANCH="
for /f "delims=" %%B in ('git branch --show-current') do set "CURRENT_BRANCH=%%B"

if not defined CURRENT_BRANCH (
    echo ERROR: The repository is in detached HEAD state.
    popd
    exit /b 1
)

if /I not "%CURRENT_BRANCH%"=="main" (
    echo ERROR: Deployments must be run from the main branch.
    echo Current branch: %CURRENT_BRANCH%
    popd
    exit /b 1
)

git pull --rebase --autostash origin main
if errorlevel 1 (
    echo ERROR: Git pull/rebase failed. Resolve the conflict before deploying.
    popd
    exit /b 1
)

popd
exit /b 0


:commit_and_push
if /I "%IS_DRY_RUN%"=="dry-run" (
    echo.
    echo [dry-run] Skipping Git commit and push.
    exit /b 0
)

echo.
echo [4/7] Committing and pushing tested changes...
pushd "%LOCAL_ROOT_PATH%"
if errorlevel 1 (
    echo ERROR: Could not enter "%LOCAL_ROOT_PATH%".
    exit /b 1
)

REM These are generated output files from the old script. Do not create
REM deployment commits just because an earlier run rewrote them.
git restore -- "react-router-bootstrap-app/frontend_test_output.txt" "backend/backend_test_output.txt" >nul 2>&1

git add -A
if errorlevel 1 (
    echo ERROR: git add failed.
    popd
    exit /b 1
)

git diff --cached --quiet
if errorlevel 2 (
    echo ERROR: git diff failed.
    popd
    exit /b 1
)
if errorlevel 1 (
    git commit -m "%COMMIT_MESSAGE%"
    if errorlevel 1 (
        echo ERROR: git commit failed.
        popd
        exit /b 1
    )
) else (
    echo No local changes to commit.
)

git push origin main
if errorlevel 1 (
    echo ERROR: git push failed. Nothing was deployed to EC2.
    popd
    exit /b 1
)

popd
exit /b 0


REM ============================================================================
REM Frontend
REM ============================================================================

:sync_content_from_server
if /I "%IS_DRY_RUN%"=="dry-run" (
    echo.
    echo [dry-run] Skipping production content.json download.
    exit /b 0
)

echo.
echo [2/7] Syncing production content.json to the local frontend...
set "CONTENT_TEMP=%TEMP%\productsite_content_%RANDOM%_%RANDOM%.json"

scp -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%:%REMOTE_CONTENT_PATH%" "%CONTENT_TEMP%"
if errorlevel 1 (
    echo ERROR: Could not download content.json from EC2.
    del /q "%CONTENT_TEMP%" >nul 2>&1
    exit /b 1
)

copy /y "%CONTENT_TEMP%" "%LOCAL_FRONTEND_PATH%\public\content.json" >nul
if errorlevel 1 (
    echo ERROR: Could not copy the downloaded content.json into the frontend.
    del /q "%CONTENT_TEMP%" >nul 2>&1
    exit /b 1
)

del /q "%CONTENT_TEMP%" >nul 2>&1
exit /b 0


:test_and_build_frontend
echo.
echo [2/7] Installing frontend dependencies...
pushd "%LOCAL_FRONTEND_PATH%"
if errorlevel 1 (
    echo ERROR: Could not enter "%LOCAL_FRONTEND_PATH%".
    exit /b 1
)

if exist package-lock.json (
    call npm ci --include=dev --no-audit --no-fund
) else (
    call npm install --include=dev --no-audit --no-fund
)

if errorlevel 1 (
    echo ERROR: Frontend dependency installation failed.
    popd
    exit /b 1
)

echo.
echo [3/7] Running frontend tests...
set "CI=true"
call npm test -- --watchAll=false
if errorlevel 1 (
    set "CI="
    echo ERROR: Frontend tests failed. Deployment stopped.
    popd
    exit /b 1
)

set "CI="

echo.
echo [3/7] Building the frontend...
call npm run build
if errorlevel 1 (
    set "CI="
    echo ERROR: Frontend build failed. Deployment stopped.
    popd
    exit /b 1
)

if not exist build\index.html (
    echo ERROR: The frontend build completed without creating build\index.html.
    popd
    exit /b 1
)

popd
exit /b 0


:deploy_frontend_remote
if /I "%IS_DRY_RUN%"=="dry-run" (
    echo.
    echo [dry-run] Would upload the React build, create a backup, and switch builds on EC2.
    exit /b 0
)

echo.
echo [5/7] Uploading the frontend build to EC2...

ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "set -e; rm -rf %REMOTE_UPLOAD_PATH%; mkdir -p %REMOTE_UPLOAD_PATH%"
if errorlevel 1 (
    echo ERROR: Could not create the temporary frontend upload directory on EC2.
    exit /b 1
)

pushd "%LOCAL_FRONTEND_PATH%"
if errorlevel 1 (
    echo ERROR: Could not enter "%LOCAL_FRONTEND_PATH%".
    exit /b 1
)

scp -i "%PEM_PATH%" -r build/* "%EC2_USER%@%EC2_IP%:%REMOTE_UPLOAD_PATH%/"
if errorlevel 1 (
    echo ERROR: Frontend upload failed.
    popd
    exit /b 1
)

popd

echo Installing the new frontend build and preserving the previous build...
ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "set -e; cd %REMOTE_ROOT_PATH%; git pull --rebase --autostash origin main; test -f %REMOTE_CONTENT_PATH%; test -d %REMOTE_ROOT_PATH%/react-router-bootstrap-app/public/images; sudo rm -rf /var/www/react_new; sudo mkdir -p /var/www/react_new; sudo cp -a %REMOTE_UPLOAD_PATH%/. /var/www/react_new/; sudo rm -rf /var/www/react_new/content.json /var/www/react_new/images; sudo ln -s %REMOTE_CONTENT_PATH% /var/www/react_new/content.json; sudo ln -s %REMOTE_ROOT_PATH%/react-router-bootstrap-app/public/images /var/www/react_new/images; sudo chmod -R a+rX /var/www/react_new; sudo rm -rf %REMOTE_REACT_BACKUP_PATH%; if [ -e %REMOTE_REACT_PATH% ]; then sudo mv %REMOTE_REACT_PATH% %REMOTE_REACT_BACKUP_PATH%; fi; sudo mv /var/www/react_new %REMOTE_REACT_PATH%; rm -rf %REMOTE_UPLOAD_PATH%"
if errorlevel 1 (
    echo ERROR: EC2 could not install the new frontend build.
    exit /b 1
)

echo Frontend deployment completed.
exit /b 0


REM ============================================================================
REM Backend and Redis
REM ============================================================================

:test_backend
echo.
echo [2/7] Preparing the local backend environment...
pushd "%LOCAL_BACKEND_PATH%"
if errorlevel 1 (
    echo ERROR: Could not enter "%LOCAL_BACKEND_PATH%".
    exit /b 1
)

if not exist "venv\Scripts\python.exe" (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Could not create the backend virtual environment.
        popd
        exit /b 1
    )
)

venv\Scripts\python.exe -m pip install --disable-pip-version-check -r requirements.txt
if errorlevel 1 (
    echo ERROR: Backend dependency installation failed.
    popd
    exit /b 1
)

echo.
echo [3/7] Running backend tests with a full traceback...

REM auth_routes creates URLSafeTimedSerializer while the tests are imported.
REM Config reads FLASK_SECRET_KEY, so provide a local test-only value when
REM the environment does not already define one.
set "DEPLOY_ADDED_TEST_SECRET=0"
if not defined FLASK_SECRET_KEY (
    set "FLASK_SECRET_KEY=productsite-local-test-only-do-not-use-in-production"
    set "DEPLOY_ADDED_TEST_SECRET=1"
)

venv\Scripts\python.exe -m pytest -vv -x --tb=long
if errorlevel 1 (
    if "%DEPLOY_ADDED_TEST_SECRET%"=="1" set "FLASK_SECRET_KEY="
    echo ERROR: Backend tests failed. Deployment stopped.
    popd
    exit /b 1
)

if "%DEPLOY_ADDED_TEST_SECRET%"=="1" set "FLASK_SECRET_KEY="
popd
exit /b 0


:ensure_redis
echo Checking Redis on EC2...
ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "redis-cli ping 2>/dev/null | grep -q '^PONG$' || (sudo systemctl start redis6 2>/dev/null || sudo systemctl start redis 2>/dev/null || sudo systemctl start redis-server 2>/dev/null || true); redis-cli ping 2>/dev/null | grep -q '^PONG$'"
if errorlevel 1 (
    echo ERROR: Redis is not installed or is not responding on EC2.
    echo Install/start Redis on EC2, then run the deployment again.
    exit /b 1
)

echo Configuring Redis keyspace-expiration notifications...
ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "redis-cli CONFIG SET notify-keyspace-events Ex >/dev/null"
if errorlevel 1 (
    echo ERROR: Redis is running, but CONFIG SET notify-keyspace-events failed.
    exit /b 1
)

exit /b 0


:deploy_backend_remote
if /I "%IS_DRY_RUN%"=="dry-run" (
    echo.
    echo [dry-run] Would pull main, migrate the database, and restart backend services on EC2.
    exit /b 0
)

echo.
echo [6/7] Deploying the backend to EC2...

call :ensure_redis
if errorlevel 1 exit /b 1

ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "set -e; cd %REMOTE_ROOT_PATH%; git pull --rebase --autostash origin main; cd %REMOTE_BACKEND_PATH%; if [ ! -x venv/bin/python ]; then python3 -m venv venv; fi; venv/bin/python -m pip install --disable-pip-version-check -r requirements.txt; venv/bin/flask --app server:app db upgrade; pm2 delete backend >/dev/null 2>&1 || true; pm2 start venv/bin/gunicorn --name backend --interpreter none --cwd %REMOTE_BACKEND_PATH% -- server:app --bind 0.0.0.0:5000 --workers 4; pm2 delete redis-listener >/dev/null 2>&1 || true; pm2 start %REMOTE_BACKEND_PATH%/scripts/redis_listener.py --interpreter %REMOTE_BACKEND_PATH%/venv/bin/python --name redis-listener; pm2 save; pm2 status"
if errorlevel 1 (
    echo ERROR: Backend deployment or PM2 restart failed on EC2.
    exit /b 1
)

echo Backend deployment completed.
exit /b 0


REM ============================================================================
REM Nginx and certificate actions
REM ============================================================================

:handle_nginx_action
if not defined SHOULD_RELOAD exit /b 0

if /I "%IS_DRY_RUN%"=="dry-run" (
    echo.
    if /I "%SHOULD_RELOAD%"=="reload" echo [dry-run] Would test and reload Nginx.
    if /I "%SHOULD_RELOAD%"=="renew-cert" echo [dry-run] Would test Nginx, renew certificates that are due, reload Nginx, and verify the certificate.
    exit /b 0
)

echo.
echo [7/7] Testing the Nginx configuration...
ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "sudo nginx -t"
if errorlevel 1 (
    echo ERROR: Nginx configuration test failed on EC2.
    exit /b 1
)

if /I "%SHOULD_RELOAD%"=="reload" (
    echo Reloading Nginx...
    ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "sudo systemctl reload nginx"
    if errorlevel 1 (
        echo ERROR: Nginx reload failed.
        exit /b 1
    )
    exit /b 0
)

if /I "%SHOULD_RELOAD%"=="renew-cert" (
    echo Renewing Let's Encrypt certificates that are due...
    ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "sudo certbot renew"
    if errorlevel 1 (
        echo ERROR: Certificate renewal failed.
        exit /b 1
    )

    echo Reloading Nginx...
    ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "sudo systemctl reload nginx"
    if errorlevel 1 (
        echo ERROR: Nginx reload failed after certificate renewal.
        exit /b 1
    )

    echo Verifying the certificate currently served by Nginx...
    ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "echo | openssl s_client -servername myplaytray.com -connect 127.0.0.1:443 2>/dev/null | openssl x509 -noout -dates -subject"
    if errorlevel 1 (
        echo ERROR: Certificate verification failed.
        exit /b 1
    )
)

exit /b 0


REM ============================================================================
REM Frontend rollback
REM ============================================================================

:rollback_frontend
if /I "%IS_DRY_RUN%"=="dry-run" (
    echo [dry-run] Would restore %REMOTE_REACT_BACKUP_PATH% to %REMOTE_REACT_PATH% and reload Nginx.
    exit /b 0
)

echo Restoring the previous frontend build...
ssh -i "%PEM_PATH%" "%EC2_USER%@%EC2_IP%" "set -e; test -d %REMOTE_REACT_BACKUP_PATH%; sudo rm -rf /var/www/react_rollback_new; sudo cp -a %REMOTE_REACT_BACKUP_PATH% /var/www/react_rollback_new; sudo rm -rf /var/www/react_failed; if [ -e %REMOTE_REACT_PATH% ]; then sudo mv %REMOTE_REACT_PATH% /var/www/react_failed; fi; sudo mv /var/www/react_rollback_new %REMOTE_REACT_PATH%; sudo nginx -t; sudo systemctl reload nginx"
if errorlevel 1 (
    echo ERROR: Frontend rollback failed. Confirm that %REMOTE_REACT_BACKUP_PATH% exists on EC2.
    exit /b 1
)

echo Frontend rollback completed.
exit /b 0


REM ============================================================================
REM Final status
REM ============================================================================

:success
echo.
if /I "%IS_DRY_RUN%"=="dry-run" (
    echo DRY RUN COMPLETED SUCCESSFULLY.
) else (
    echo DEPLOYMENT COMPLETED SUCCESSFULLY.
)
endlocal
exit /b 0

:fail
echo.
echo DEPLOYMENT FAILED. No later deployment steps were run.
endlocal
exit /b 1
