#!/usr/bin/env ts-node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

(async () => {
    await yargs(hideBin(process.argv))
        .scriptName('devenv')
        .commandDir('./commands', { extensions: ['ts'], recurse: true })
        .parse();
})();