@echo off

wsl --install > nul 2>&1
wsl --update
wsl --shutdown
wsl --set-default-version 2

install.cmd 