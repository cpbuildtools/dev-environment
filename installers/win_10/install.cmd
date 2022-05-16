
@echo off 
wsl -l -q 2> nul || goto :enableWSL

echo Downloading wsl update...
curl --ssl https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi > uwsl.msi && uwsl.msi
wsl --update 2> nul

wsl --shutdown
wsl --set-default-version 2

install.cmd

goto :eof

:enableWSL

echo Enabling Windows Subsystem Linux (this could take a while)...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

echo Enabling Virtual Machine Platform (this could also take a while)...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

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
