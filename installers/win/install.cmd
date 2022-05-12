@echo off


winget list Canonical.Ubuntu.2004 > nul 2>&1 || goto installUbuntu


:installUbuntu
echo [96mInstalling Ubuntu 20.04[0m
winget install Canonical.Ubuntu.2004 --accept-package-agreements --accept-source-agreements
rem Get the file name of the ubuntu executable
for /f "delims=" %%a in ('dir /b %userprofile%\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu20.04onWindows*') do set "ubuntuFile=%%a"
start %userprofile%\AppData\Local\Microsoft\WindowsApps\%ubuntuFile%\ubuntu2004.exe

echo [93m 
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

wsl -t Ubuntu-20.04

wsl -d Ubuntu-20.04 --cd ~ curl --ssl https://raw.githubusercontent.com/cpbuildtools/devcontainer-ngdotnet/release/latest/install/install_wsl.sh -o install.sh
wsl -d Ubuntu-20.04 --cd ~ chmod +x install.sh
wsl -d Ubuntu-20.04 --cd ~ ./install.sh --appdata="%appdata%"

wsl -t Ubuntu-20.04

wsl -d Ubuntu-20.04 --cd ~ curl --ssl https://raw.githubusercontent.com/cpbuildtools/devcontainer-ngdotnet/release/latest/install/initialize_wsl.sh -o initialize.sh
wsl -d Ubuntu-20.04 --cd ~ chmod +x initialize.sh
wsl -d Ubuntu-20.04 --cd ~ ./initialize.sh --appdata="%appdata%" 
