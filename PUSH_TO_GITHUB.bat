@echo off
setlocal enabledelayedexpansion
title Push VIVAAN to GitHub

echo ====================================================================
echo   VIVAAN Digital Agricultural Marketplace - GitHub Push Tool
echo ====================================================================
echo.

set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"

echo [1/3] Checking Git status...
git status -s
echo.

echo [2/3] Verifying Remote:
git remote -v
echo.

echo [3/3] Pushing 'main' branch to https://github.com/Thinakar8/VIVAAN-WEB.git ...
echo If prompted, sign in via your browser or paste your Personal Access Token.
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo   SUCCESS: Project successfully pushed to GitHub!
    echo   Repository URL: https://github.com/Thinakar8/VIVAAN
    echo ====================================================================
) else (
    echo.
    echo --------------------------------------------------------------------
    echo   Push failed or was cancelled. If you need a Personal Access Token:
    echo   Visit: https://github.com/settings/tokens
    echo --------------------------------------------------------------------
)

echo.
pause
