#!/bin/bash

echo "source"
source ~/.bashrc
echo "cd"
cd ~/devenv-cli
echo "link"
pnpm link --global
