
import chalk from 'chalk';
import { Arguments, Argv } from 'yargs';
import { installApplications, updateApplications } from '../../util/applications';
import { promptConfig } from '../configure';


export const command = 'install';
export const describe = 'install the dev environment';
export const builder = (yargs: Argv) => {
    return yargs
        .command('config', 'Runs the install configuration script',
            builder => builder,
            args =>
                installConfig(args.setConfig as string[]))
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
        .command('setup-docker', 'Installs Applications to the dev env',
            builder => builder
                .option('appdata', {
                    type: 'string'
                }).demandOption('appdata'),
            args => setupDockerDesktop(args.appdata))
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
        .option('appdata', {
            type: 'string'
        }).demandOption('appdata')
};

export const handler = async (argv: Arguments) => {
    await installConfig(argv.setConfig as string[]);
    await installCoreApps(argv.updateOnly as boolean);
    if (!argv.skipOptional) {
        await installApps('!Core', argv.updateOnly as boolean)
    }
    await setupDockerDesktop(argv.appdata as string);
};

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


}