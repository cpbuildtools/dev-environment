#!/bin/bash

################################
# Install Node JS              #
################################
echo Installing Node JS
curl --silent --ssl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install 16
nvm use 16

################################
# Install PNPM                 #
################################
echo Installing PNPM
npm i -g pnpm
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

################################
# Install Node JS Global Utils #
################################
pnpm setup
pnpm i -g typescript @types/node ts-node

################################
# Clone Installer from Github  #
################################
echo Installing WSL Installer
cd ~
rm -rf ./.tmp
git clone --branch main https://github.com/cpbuildtools/dev-environment.git ./.tmp

rm -rf ./devenv-cli
mkdir -p ./devenv-cli
cp -r ./.tmp/cli/* ./devenv-cli

cd ./devenv-cli
chmod +x ./intall.sh
pnpm i
