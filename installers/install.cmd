@echo off

rem curl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/install.cmd > "%temp%\devenv_intaller.cmd" && "%temp%\devenv_intaller.cmd"

:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
    IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
>nul 2>&1 "%SYSTEMROOT%\SysWOW64\cacls.exe" "%SYSTEMROOT%\SysWOW64\config\system"
) ELSE (
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
)

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:-------------------------------------- 

setlocal
    set "repo=https://raw.githubusercontent.com/cpbuildtools/dev-environment/main"
    set "rng=%random%%random%%random%"
    set "tmpPath=%temp%\dev-environment-%rng%"
    mkdir %tmpPath% > nul 2>&1

    curl --silent %repo%/installers/windows.cmd > %tmpPath%\windows.cmd && %tmpPath%\windows.cmd
endlocal