 
echo [95m 
echo ************************************************************
echo.
echo              Devlopment Environment Installer
echo.
echo ************************************************************
echo [0m

echo [96mDetecting Windows version...[0m
for /f "tokens=4-7 delims=. " %%i in ('ver') do (
    set fullVersion=%%i.%%j.%%k.%%l
    set mainVersion=%%i
    set subVersion=%%k
)

if "%mainVersion%" == "10" if not "%subVersion%" == "22000" goto install_10
if "%mainVersion%" == "10" if "%subVersion%" == "22000" goto install_11

echo [91mUnsupported Windows Version %fullVersion%[0m
exit 1

:install_10
echo [96mDownloading  Windows [93m100[96m Installer...[0m
curl --ssl --silent %repo%/installers/win/install.cmd > %tmpPath%\install.cmd
curl --ssl --silent %repo%/installers/win_10/install.cmd > %tmpPath%\install_10.cmd
cd %tmpPath%
echo [92mStarting Windows [93m10[92m Installer.[0m
install_10.cmd
goto end

:install_11
echo [96mDownloading  Windows [93m11[96m Installer...[0m
curl --ssl --silent %repo%/installers/win/install.cmd > %tmpPath%\install.cmd
curl --ssl --silent %repo%/installers/win_11/install.cmd > %tmpPath%\install_11.cmd
cd %tmpPath%
echo [92mStarting Windows [93m11[92m Installer.[0m
install_11.cmd
goto end

:end