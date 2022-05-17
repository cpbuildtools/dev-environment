
import { existsSync } from 'fs';
import inquirer, { InputQuestion } from 'inquirer';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { exit } from 'process';
import simpleGit from 'simple-git';
import { Argv } from 'yargs';
import { exec } from '../../util/cmd';
import { config } from '../configure';


const homePath = homedir();


/**********************************************************
 *  Command
 *********************************************************/

export const command = 'containers';
export const describe = 'Containers Menu';
export const builder = (yargs: Argv) => {
    return yargs
        .command('clone', 'Clone a dev container',
            builder => builder,
            args => cloneDevContainer()
        )
        .command('create', 'Create a dev container',
            builder => builder,
            args => createDevContainer()
        )
        .command('open', 'open a dev container',
            builder => builder,
            args => launchDevContainer()
        )
        ;
};

export const handler = async (args: any) => {

};

// End Command


async function cloneDevContainer() {
    const cfg = await config();
    const user = cfg.github_user;
    const token = cfg.github_token;
    let containerRoot = cfg.container_root ?? '~/development';
    if (containerRoot.startsWith('~/')) {
        containerRoot = join(homedir(), containerRoot.substring(2));
    }
    containerRoot = resolve(containerRoot);

    const answer = await inquirer.prompt({
        type: 'input',
        name: 'repo',
        message: 'Repository to clone:',
        default: `${user}/devcontainer-default`
    } as InputQuestion);

    let repo = answer.repo as string;
    if (repo.startsWith('https://github.com/') && repo.endsWith('.git')) {
        repo = repo.substring('https://github.com/'.length, repo.lastIndexOf('.'));
    }
    if (repo.startsWith('https://github.com/')) {
        repo = repo.substring('https://github.com/'.length);
    }
    if (repo.startsWith('https://') || repo.startsWith('http://')) {
        throw new Error('Only https://github.com is currenly supported');
    }

    const path = join(containerRoot, repo);
    var result = await exec(`gh repo clone ${repo} ${path}`);
    if (!!result) {
        exit(result);
    }
}

async function createDevContainer() {

}

async function launchDevContainer() {

}
