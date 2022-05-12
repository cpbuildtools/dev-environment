@echo off
rem curl --ssl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/windows.cmd > %temp%\devenv_intaller.cmd && %temp%\devenv_intaller.cmd
setlocal
set tmpPath=%temp%\dev-environment
echo TempPath: %tmpPath%
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i
if "%version%" == "10" goto install_10
if "%version%" == "11" goto intall_11

echo Unsupported Windows Version %version%
exit 1

:install_10
mkdir %tmpPath%
curl --ssl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/win/install.cmd > %tmpPath%\install.cmd
curl --ssl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/win_10/install.cmd > %tmpPath%\install_10.cmd
%tmpPath%\install_10.cmd
goto end

:install_11
mkdir %tmpPath%
curl --ssl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/win/install.cmd > %tmpPath%\install.cmd
curl --ssl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/win_11/install.cmd > %tmpPath%\install_11.cmd
%tmpPath%\install_11.cmd
goto end

:end
endlocal