@echo off
wsl --status > nul 2>&1 || goto enableWSL
wsl --update

echo wsl --shutdown
wsl --shutdown

wsl --set-default-version 2

install.cmd 
goto end

:enableWSL

wsl --install > nul 2>&1

echo.
echo.
echo.
echo Enabled Windows Subsystem for Linux. Please restart your computer and run this script again.
echo.
echo.
echo.
pause

:end