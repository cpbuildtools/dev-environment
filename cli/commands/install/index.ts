
import chalk from 'chalk';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { Arguments, Argv } from 'yargs';
import { installApplications, updateApplications } from '../../util/applications';
import { exec } from '../../util/cmd';
import { dockerLogin, getDockerConfigPath, getDockerDesktopPath, restartDocker } from '../../util/docker';
import { getEnv } from '../../util/env';
import { githubLogin } from '../../util/github';
import { readJsonFile, writeJsonFile } from '../../util/json';
import { rebootWindows } from '../../util/reboot';
import { sleep } from '../../util/sleep';
import { escapeString } from '../../util/strings';
import { installVSCodeExtension } from '../../util/vscode';
import { config, promptConfig } from '../configure';


export const command = 'install';
export const describe = 'install the dev environment';
export const builder = (yargs: Argv) => {
    return yargs
        .command('install-apps [category]', 'Installs Applications to the dev env',
            builder => builder
                .positional('category', {
                    type: 'string',
                    default: '*',
                })
                .option('update-only', {
                    type: 'boolean',
                    default: false,
                    alias: 'u'
                }),
            args => installApps(args.category, args.updateOnly))
        .option('set-config', {
            type: 'string'
        })
        .array('set-config')
        .option('update-only', {
            type: 'boolean',
            default: false,
            alias: 'u'
        })
        .option('skip-optional', {
            type: 'boolean',
            default: false,
        })
        .option('resume', {
            type: 'number',
            default: 0,
        })
        .option('appdata', {
            type: 'string'
        }).demandOption('appdata')
};

export const handler = async (argv: Arguments) => {
    if (!argv.resume) {
        await installConfig(argv.setConfig as string[]);
        await installCoreApps(argv.updateOnly as boolean);
        if (!argv.skipOptional) {
            await installApps('!Core', argv.updateOnly as boolean);
        }
        const rebootCmd = `devenv install --resume 1 --appdata "${argv.appdata}"`;
        await rebootWindows(`wsl -d Ubuntu-20.04 --cd ~ bash -ic "${escapeString(rebootCmd)}"`);
    } else if (argv.resume === 1) {
        
        await setupDockerDesktop(argv.appdata as string);
        await initializeDevContainers();

        await installVSCodeExtensions();
        await initialized();
    }
};

async function installVSCodeExtensions() {
    await installVSCodeExtension('ms-vscode-remote.vscode-remote-extensionpack');
    await installVSCodeExtension('ms-azuretools.vscode-docker');
}


async function installConfig(setConfig: string[]) {
    await promptConfig(setConfig);
}

async function installApps(category: string, updateOnly: boolean) {
    await (updateOnly ? updateApplications(category) : installApplications(category));
}

async function installCoreApps(updateOnly: boolean) {

    console.info();
    console.info(chalk.yellowBright('********************************************************************'));
    if (updateOnly) {
        console.info(chalk.yellowBright('* Updating Core Applications                                       *'));
    } else {
        console.info(chalk.yellowBright('* Installing Core Applications                                     *'));
    }
    console.info(chalk.yellowBright('********************************************************************'));
    console.info();

    await installApps('Core', updateOnly);
}

async function setupDockerDesktop(windowsAppDataPath: string) {
    try {
        const cmd = `"${await getDockerDesktopPath()}/Docker Desktop.exe" &`;
        await exec(cmd);
        const dockerConfigPath = await getDockerConfigPath(windowsAppDataPath);
        while (!existsSync(dockerConfigPath)) {
            await sleep(500);
        }

        // Enable WSL Docker Integration
        const dockerConfig = await readJsonFile(dockerConfigPath);
        const integratedWslDistros = (dockerConfig.integratedWslDistros ?? []) as string[];
        if (integratedWslDistros.indexOf('Ubuntu-20.04') === -1) {
            integratedWslDistros.push('Ubuntu-20.04');
        }
        dockerConfig.integratedWslDistros = integratedWslDistros;
        await writeJsonFile(dockerConfigPath, dockerConfig);

        await restartDocker(windowsAppDataPath);

        const user = getEnv('GITHUB_USER')!;
        const token = getEnv('GITHUB_TOKEN')!;
       
        await dockerLogin('ghcr.io', user, token);
        await dockerLogin('docker.pkg.github.com', user, token);
        await githubLogin(user, token);

    } catch (e) {
        console.error(e);
        throw e;
    }
}

async function initializeDevContainers() {
    const cfg = await config();

    let containerRoot = cfg.container_root ?? '~/development';
    if (containerRoot.startsWith('~/')) {
        containerRoot = join(homedir(), containerRoot.substring(2));
    }
    containerRoot = resolve(containerRoot);

    if (!existsSync(containerRoot)) {
        await mkdir(containerRoot, { recursive: true });
    }
}

async function initialized() {
    console.info();
    console.info(chalk.green('********************************************************************'));
    console.info(chalk.green('* Dev Environment Installed!!!                                     *'));
    console.info(chalk.green('********************************************************************'));
    console.info();
    await exec(`devenv`);
}