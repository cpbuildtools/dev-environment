
import { existsSync } from 'fs';
import inquirer, { InputQuestion, ListChoiceOptions, ListQuestion } from 'inquirer';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { exit } from 'process';
import simpleGit from 'simple-git';
import { Argv } from 'yargs';
import { exec } from '../../util/cmd';
import { config } from '../configure';

import glob from 'fast-glob'
import { readJsonFile } from '../../util/json';
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
            args => showContainerMenu()
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



async function showContainerMenu() {
    const cfg = await config();
    let containerRoot = cfg.container_root ?? '~/development';
    if (containerRoot.startsWith('~/')) {
        containerRoot = join(homedir(), containerRoot.substring(2));
    }
    containerRoot = resolve(containerRoot);

    const choices = await Promise.all( (await findDevContainerFiles())
    .map(async (file) =>{
        const path = join(containerRoot, file);
        const root = dirname(dirname(file));
        const data = await readJsonFile(path);
        const name = data.name;
        return {
            type: 'choice',
            name: `${name} [${root}]`,
            short: name,
            value: {
                name,
                path,
                file,
                root
            }
        } as ListChoiceOptions
    }));

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'container',
        message: 'Select a dev container',
        choices
    } as ListQuestion) as any;

    console.log(answers);

}


async function findDevContainerFiles() {
    const cfg = await config();
    let containerRoot = cfg.container_root ?? '~/development';
    if (containerRoot.startsWith('~/')) {
        containerRoot = join(homedir(), containerRoot.substring(2));
    }
    containerRoot = resolve(containerRoot);
    return await glob('**/.devcontainer/devcontainer.json', { cwd: containerRoot, dot: true })
}

async function findDevContainerFolders() {
    return (await findDevContainerFiles()).map(c => dirname(dirname(c)));
}

async function findDevContainerWorkspaces(containerFolder: string) {
    return await glob('**/*.code-workspace', { cwd: containerFolder });
}