
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import inquirer, { InputQuestion, ListQuestion, ChoiceCollection } from 'inquirer';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { exit } from 'process';
import simpleGit from 'simple-git';
import { Argv } from 'yargs';
import { exec } from '../../util/cmd';
import { getEnv } from '../../util/env';
import { config } from '../configure';

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
    console.info(chalk.green('* Dev Environment Cli                                              *'));
    console.info(chalk.green('********************************************************************'));
    console.info();

    let answer = { action: null };

    const menu = [
        {
            name: 'Containers',
            value: 'containers'
        },
        {
            name: 'Update',
            value: 'update'
        },
        {
            name: 'Config',
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
            message: 'Select an option',
            choices: menu
        } as ListQuestion) as any;

        switch (answer.action) {
            case 'update':
                await updateMenu();
                break;
            case 'config':
                await configMenu();
            case 'containers':
                await containerMenu();
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
            message: 'Action',
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
                name: 'Show',
                value: 'show'
            },
            {
                name: 'Update',
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
            case 'update':
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

    async function containerMenu() {
        const menu = [
            {
                name: 'Open',
                value: 'launch'
            },
            {
                name: 'Clone',
                value: 'clone'
            },
            {
                name: 'Create [NYI]',
                value: 'create'
            },
            {
                name: 'Cancel',
                value: 'cancel'
            }
        ];

        const answer = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Action',
            choices: menu
        } as ListQuestion);

        switch (answer.action) {
            case 'clone':
                await cloneDevContainer() || exit(0);
            case 'create':
                await createDevContainer() || exit(0);
            case 'launch':
                await launchDevContainer() || exit(0);
        }

    }

    async function cloneDevContainer() {
        return await exec('devenv containers clone');
    }
    async function createDevContainer() {
        return await exec('devenv containers create');
    }
    async function launchDevContainer() {
        return await exec('devenv containers open');
    }

}
