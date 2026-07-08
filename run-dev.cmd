@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "C:\Users\DESKTOP\Documents\New project"
"C:\Program Files\nodejs\npm.cmd" run dev > dev-server.log 2>&1
