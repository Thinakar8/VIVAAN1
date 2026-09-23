@echo off
chcp 65001 >nul
title VIVAAN - Digital Agricultural Marketplace (National Edition)
echo ======================================================================
echo          🌾 VIVAAN - Digital Agricultural Marketplace 🌾
echo                  National Agricultural Platform Edition
echo ======================================================================
echo.
echo Starting VIVAAN Full-Stack Application on http://localhost:5000 ...
echo Opening your web browser automatically in 2 seconds...
echo.

cd /d %~dp0
start "" http://localhost:5000
node server/server.js

pause
