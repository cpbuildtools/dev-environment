
import { homedir } from 'os';
import { Argv } from 'yargs';

const homePath = homedir();


/**********************************************************
 *  Command
 *********************************************************/

export const command = '$0';
export const describe = 'Dev Env Menu';
export const builder = (yargs: Argv) => {
    return yargs
};

export const handler = (args: any) => {
    console.log('How may i help?');
};

// End Command
