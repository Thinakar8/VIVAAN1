@echo off
setlocal enabledelayedexpansion
title Push VIVAAN to GitHub

echo ====================================================================
echo   VIVAAN Digital Agricultural Marketplace - GitHub Push Tool
echo ====================================================================
echo.

set "PATH=C:\Users\DELL\.gemini\antigravity\scratch\mingit\cmd;C:\Users\DELL\.gemini\antigravity\scratch\mingit\mingw64\bin;%PATH%"

echo [1/3] Checking Git repository status...
git status -s
echo.

echo [2/3] Verifying Remote:
git remote -v
echo.

echo [3/3] Pushing 'main' branch to https://github.com/Thinakar8/VIVAAN.git ...
echo (If prompted, authenticate in your browser or enter your GitHub Personal Access Token)
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
    echo   If authentication is needed, you can generate a Personal Access
    echo   Token at: https://github.com/settings/tokens
    echo   Select 'repo' scope and use the token as your password.
    echo --------------------------------------------------------------------
)

echo.
pause
