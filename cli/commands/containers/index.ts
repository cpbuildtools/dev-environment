
import chalk from 'chalk';
import glob from 'fast-glob';
import inquirer, { InputQuestion, ListChoiceOptions, ListQuestion } from 'inquirer';
import { homedir } from 'os';
import { dirname, join, resolve, parse } from 'path';
import { exit } from 'process';
import { Argv } from 'yargs';
import { exec, run } from '../../util/cmd';
import { readJsonFile } from '../../util/json';
import { launchVSCodeDevContainer } from '../../util/vscode';
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
        console.error('Only https://github.com is currently supported');
        exit(1);
    }

    const path = join(containerRoot, repo);
    try{
        await run(`gh repo clone ${repo} ${path}`);
        await showClonedContainerOptions(repo);
    }catch(e){
        console.error(e);
    }



}

async function showClonedContainerOptions(repo: string) {
    const devCont = (await buildContainerChoices()).find(c => c.value.shortDir === repo);
    if (devCont) {
        await showContainerWorkspaceMenu(devCont.value);
    }
}



async function createDevContainer() {

}



interface ContainerMenuItem {
    configPath: string;
    rootDir: string;
    shortDir: string;
    config: {
        name: string;
        workspaceFolder: string;
        [k: string]: unknown;
    };
}

interface ContainerWorkspaceMenuItem {
    container: ContainerMenuItem,
    path: string;
    absPath: string;
}

async function buildContainerChoices() {
    const cfg = await config();
    let containerRoot = cfg.container_root ?? '~/development';
    if (containerRoot.startsWith('~/')) {
        containerRoot = join(homedir(), containerRoot.substring(2));
    }
    containerRoot = resolve(containerRoot);
    return await Promise.all((await findDevContainerFiles())
        .map(async (file) => {
            const configPath = join(containerRoot, file);
            const rootDir = dirname(dirname(configPath));
            const shortDir = dirname(dirname(file));

            const config = await readJsonFile(configPath);
            const name = config.name;
            return {
                type: 'choice',
                name: `${name} [${shortDir}]`,
                short: name,
                value: {
                    configPath,
                    rootDir,
                    shortDir,
                    config
                } as ContainerMenuItem
            }
        }));
}

async function showContainerMenu() {
    const choices = await buildContainerChoices();
    if (choices.length) {
        const answers = await inquirer.prompt({
            type: 'list',
            name: 'container',
            message: 'Select a dev container',
            choices
        } as ListQuestion) as any;
        await showContainerWorkspaceMenu(answers.container);
    } else {
        console.error(chalk.yellow(`You do not have any dev containers.`))
        exit(1);
    }
}

async function showContainerWorkspaceMenu(container: ContainerMenuItem) {
    const choices = (await findDevContainerWorkspaces(container.rootDir)).map(ws => {
        const file = parse(ws);
        return {
            type: 'choice',
            name: file.name,
            value: {
                container,
                path: ws,
                absPath: join(container.rootDir, 'workspaces', ws)
            } as ContainerWorkspaceMenuItem
        } as ListChoiceOptions

    });

    choices.push({
        type: 'choice',
        name: "No Workspace (open dev container directly)",
        short: "No Workspace",
        value: {
            container
        }
    });

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'selection',
        message: 'Select a workspace',
        choices
    } as ListQuestion) as any;

    await launchDevContainer(answers.selection);

}

async function launchDevContainer(selection: ContainerWorkspaceMenuItem) {
    console.log(selection);
    launchVSCodeDevContainer(
        selection.container.rootDir,
        join(selection.container.config.workspaceFolder, selection.path ?? '')
    );
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
    return await glob('**/*.code-workspace', { cwd: join(containerFolder, 'workspaces') });
}