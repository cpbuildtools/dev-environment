
import chalk from 'chalk';
import inquirer, { ListQuestion } from 'inquirer';
import { homedir } from 'os';
import { exit } from 'process';
import { Argv } from 'yargs';
import { exec } from '../../util/cmd';

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

    while (answer.action !== 'exit') {
        answer = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: '',
            menu
        } as ListQuestion) as any;

        switch (answer.action) {
            case 'update':
                await updateMenu();
                break;
            case 'config':
                await configMenu();
                break;
        }
    }


    async function updateMenu() {
        const menu = [
            {
                name: 'Update Cli',
                value: 'cli'
            },
            {
                name: 'Update Cli and Apps',
                value: 'apps'
            },
            {
                name: 'Cancel',
                value: 'cancel'
            }
        ];

        const answer = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: '',
            choices: menu
        } as ListQuestion);

        switch (answer.action) {
            case 'cli':
                await updateCli();
                exit(0);
            case 'apps':
                await updateApps();
                exit(0);
        }

    }

    async function updateCli() {
        await exec('devenv update --cli');
    }

    async function updateApps() {
        await exec('devenv update');
    }


    async function configMenu() {
        const menu = [
            {
                name: 'Show Config',
                value: 'show'
            },
            {
                name: 'Update Config',
                value: 'update'
            },
            {
                name: 'Cancel',
                value: 'cancel'
            }
        ];

        const answer = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: '',
            choices: menu
        } as ListQuestion);

        switch (answer.action) {
            case 'show':
                await showConfig();
                exit(0);
            case 'apps':
                await updateConfig();
                exit(0);
        }

    }

    async function showConfig() {
        await exec('devenv config show');
    }

    async function updateConfig() {
        await exec('devenv config');
    }

}
