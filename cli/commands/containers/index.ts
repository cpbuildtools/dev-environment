
import glob from 'fast-glob';
import inquirer, { InputQuestion, ListChoiceOptions, ListQuestion } from 'inquirer';
import { homedir } from 'os';
import { dirname, join, resolve, parse } from 'path';
import { exit } from 'process';
import { Argv } from 'yargs';
import { exec } from '../../util/cmd';
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



interface ContainerMenuItem {
    configPath: string;
    rootDir: string;
    shortDir: string;
    config: {
        name: string;
        [k: string]: unknown;
    };
}

interface ContainerWorkspaceMenuItem {
    container: ContainerMenuItem,
    path: string;
    absPath: string;
}

async function showContainerMenu() {
    const cfg = await config();
    let containerRoot = cfg.container_root ?? '~/development';
    if (containerRoot.startsWith('~/')) {
        containerRoot = join(homedir(), containerRoot.substring(2));
    }
    containerRoot = resolve(containerRoot);

    const choices = await Promise.all((await findDevContainerFiles())
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
            } as ListChoiceOptions
        }));

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'container',
        message: 'Select a dev container',
        choices
    } as ListQuestion) as any;

    await showContainerWorkspaceMenu(answers.container);
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
                absPath: join(container.rootDir, ws)
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

async function launchDevContainer(selection:ContainerWorkspaceMenuItem) {
    await launchVSCodeDevContainer(selection.container.rootDir, selection.path)

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