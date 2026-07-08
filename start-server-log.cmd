@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo [%date% %time%] starting server> server.log
"C:\Program Files\nodejs\npm.cmd" run start >> server.log 2>&1
