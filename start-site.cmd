@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
"C:\Program Files\nodejs\npm.cmd" run build
"C:\Program Files\nodejs\npm.cmd" run start
pause
