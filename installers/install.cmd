rem curl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/install.cmd > "%temp%\devenv_intaller.cmd" && "%temp%\devenv_intaller.cmd"

@echo off
setlocal
    set "repo=https://raw.githubusercontent.com/cpbuildtools/dev-environment/main"
    set "rng=%random%%random%%random%"
    set "tmpPath=%temp%\dev-environment-%rng%"
    mkdir -p %tmpPath%

    curl --silent %repo%/installers/windows.cmd > %tmpPath%\windows.cmd && %tmpPath%\windows.cmd
endlocal
