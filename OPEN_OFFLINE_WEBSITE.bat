@echo off
chcp 65001 >nul
title VIVAAN - Offline Digital Marketplace
echo Opening VIVAAN standalone marketplace in your default browser...
cd /d %~dp0
start  %~dp0index.html
