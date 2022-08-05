#!/usr/bin/env ts-node

import { exit } from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { sleep } from './util/sleep';

(async () => {
    try{
        await yargs(hideBin(process.argv))
            .scriptName('devenv')
            .commandDir('./commands', { extensions: ['ts'], recurse: true })
            .command('_init_dev_container_', false, (yargs) => yargs, (argv) =>{
                
            })
            .parse();
    }catch(e){
        console.error(e);
        await sleep(60 * 1000);
        exit(1);
    }
})();