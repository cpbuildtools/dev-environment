# Installation 

## Windows 10/11

  1. Press the start button and type `Check for Updates` and press Enter 
  1. Click `Advanced Options` 
  1. Make sure `Receive updates from other Microsoft products` is turned on
  1. Make sure windows is up to date with all patches and drivers
  1. Open the `Microsoft Store`
  1. Search for `App Installer` by Microsoft
      -  Note: In some versions of windows the app installer appears installed but is not fully installed
  1. Install the `App Installer`
  1. To verify that that installer installed
     ``` 
     winget --version
     ```
  1. Open a cmd terminal as Administrator
  1. Run:  
     ```
     curl https://raw.githubusercontent.com/cpbuildtools/dev-environment/main/installers/install.cmd > "%temp%\devenv_intaller.cmd" && "%temp%\devenv_intaller.cmd"
     ``` 

# CLI

Open an Ubuntu 20.04 terminal and run the `devenv` command
## Menu
``` 
devenv
```
## Help
``` 
devenv --help
```
```
 Commands:
  devenv config [key] [value]  configure the dev environment
  devenv containers            Containers Menu
  devenv                       Dev Env Menu                            [default]
  devenv install               install the dev environment
  devenv update                Update Dev Env

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```