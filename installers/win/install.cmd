@echo off

winget list Canonical.Ubuntu.2004 && goto ubuntuInstalled

echo [96mInstalling Ubuntu 20.04[0m
winget install Canonical.Ubuntu.2004 --accept-package-agreements --accept-source-agreements
rem Get the file name of the ubuntu executable
for /f "delims=" %%a in ('dir /b %userprofile%\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu20.04onWindows*') do set "ubuntuFile=%%a"
start %userprofile%\AppData\Local\Microsoft\WindowsApps\%ubuntuFile%\ubuntu2004.exe

echo [33m 
echo ************************************************************
echo.
echo Complete the ubuntu setup in the ubuntu terminal. 
echo Once ubuntu is set up return to this window.
echo.
echo ************************************************************
echo [0m

echo [93m 
pause
echo [0m

taskkill /IM "ubuntu2004.exe" /F > nul 2>&1
wsl -t Ubuntu-20.04

:ubuntuInstalled
echo [96mDownloading [93mDev Enviroment Cli[96m...[0m

wsl -d Ubuntu-20.04 --cd ~ bash -ic "rm -f ~/dev-env-installer.sh"
wsl -d Ubuntu-20.04 --cd ~ bash -ic "curl --ssl %repo%/installers/wsl/install.sh -o ~/dev-env-installer.sh"
wsl -d Ubuntu-20.04 --cd ~ bash -ic "chmod +x ~/dev-env-installer.sh"
wsl -d Ubuntu-20.04 --cd ~ bash -ic "./dev-env-installer.sh"
wsl -d Ubuntu-20.04 --cd ~ bash -ic "cd ~/devenv-cli && ./install.sh"
wsl -d Ubuntu-20.04 --cd ~ bash -ic "devenv install --appdata=\"%appdata%\""
