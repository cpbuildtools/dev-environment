
import chalk from 'chalk';
import inquirer, { ListQuestion } from 'inquirer';
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

export const handler = async (args: any) => {
    await mainMenu();
};

// End Command

async function mainMenu() {
    
    console.info();
    console.info(chalk.green('********************************************************************'));
    console.info(chalk.green('* Dev container prerequisites installed and configured             *'));
    console.info(chalk.green('********************************************************************'));
    console.info();
    
    let answer = { action: null };

    const menu = [
        {
            name: 'Launch a Dev Container',
            value: 'launch'
        },
        {
            name: 'Clone a dev container',
            value: 'clone'
        },
        {
            name: 'Create a dev container',
            value: 'create'
        },
        {
            name: 'Update Dev Environment',
            value: 'update'
        },
        {
            name: 'Config Dev Environment',
            value: 'config'
        },
        {
            name: 'Exit.',
            value: 'exit'
        }
    ];

    while(answer.action !== 'exit'){        
        answer = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: '',
            menu
        } as ListQuestion) as any;

        switch(answer.action){
            case "":
                break;
        }
    }


}
