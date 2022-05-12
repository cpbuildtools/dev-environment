rem curl --ssl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/windows.cmd > %temp%\devenv_intaller.cmd && %temp%\devenv_intaller.cmd
@echo off
setlocal
set tmpPath=%temp%\dev-environment
set repo=https://raw.githubusercontent.com/cpbuildtools/dev-environment/main

echo [95m 
echo ************************************************************
echo.
echo              Devlopment Environment Installer
echo.
echo ************************************************************
echo [0m


echo [96mDetecting Windows version...[0m

for /f "tokens=4-7 delims=. " %%i in ('ver') do set FULL_VERSION=%%i.%%j.%%k.%%l
for /f "tokens=4-6 delims=. " %%i in ('ver') do set VERSION=%%i
for /f "tokens=4-6 delims=. " %%i in ('ver') do set SUB_VERSION=%%k


if "%VERSION%" == "10" if not "%SUB_VERSION%" == "22000" goto install_10
if "%VERSION%" == "10" if "%SUB_VERSION%" == "22000" goto install_11

echo [91mUnsupported Windows Version %FULL_VERSION%[0m

rem tmp
goto end
exit 1

:install_10
echo [96mDownloading  Windows [93m100[96m Installer...[0m
del /f/s/q %tmpPath%  > nul 2>&1
rmdir /s/q %tmpPath%
mkdir %tmpPath% > nul 2>&1
curl --ssl --silent %repo%/installers/win/install.cmd > %tmpPath%\install.cmd
curl --ssl --silent %repo%/installers/win_10/install.cmd > %tmpPath%\install_10.cmd
cd %tmpPath%
echo [92mStarting Windows [93m10[92m Installer.[0m
install_10.cmd
goto end

:install_11
echo [96mDownloading  Windows [93m11[96m Installer...[0m
del /f/s/q %tmpPath%  > nul 2>&1
rmdir /s/q %tmpPath%
mkdir %tmpPath% > nul 2>&1
curl --ssl --silent %repo%/installers/win/install.cmd > %tmpPath%\install.cmd
curl --ssl --silent %repo%/installers/win_11/install.cmd > %tmpPath%\install_11.cmd
cd %tmpPath%
echo [92mStarting Windows [93m11[92m Installer.[0m
install_11.cmd
goto end

:end
endlocal