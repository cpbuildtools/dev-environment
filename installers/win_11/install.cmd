@echo off
wsl --status > nul 2>&1 || goto enableWSL
wsl --update

echo wsl --shutdown
wsl --shutdown
wsl --set-default-version 2

install.cmd 
goto :eof

:enableWSL

wsl --install > nul 2>&1

reg add HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce /v "!devenv-installer" /d "%temp%\devenv_intaller.cmd" /f
echo.
echo.
echo.
echo Enabled Windows Subsystem for Linux. Please restart your computer and run this script again.
echo.
echo Press any key to restart, or press ctrl+c to exit.
echo.
pause
shutdown -r -t 0
