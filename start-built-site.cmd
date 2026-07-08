@echo off
setlocal
title ShoppingDogam Watchdog - DO NOT CLOSE
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo ShoppingDogam watchdog is running.
echo Keep this window open or minimized.
echo URL: http://127.0.0.1:3000
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-watchdog.ps1"
