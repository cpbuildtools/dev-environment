
import chalk from 'chalk';
import { Arguments, Argv } from 'yargs';
import { installApplications, updateApplications } from '../../util/applications';
import { promptConfig } from '../configure';


export const command = 'install [step]';
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
        .option('set-config', {
            type: 'string'
        })
        .array('set-config')
        .option('update-only', {
            type: 'boolean',
            default: false,
            alias: 'u'
        })
};

export const handler = async (argv: Arguments) => {
    await installConfig(argv.setConfig as string[]);
    await installCoreApps(argv.updateOnly as boolean);
};

async function installConfig(setConfig: string[]) {
    await promptConfig(setConfig);
}

async function installApps(category: string, updateOnly: boolean) {
    console.group(chalk.yellowBright(category));
    await (updateOnly ? updateApplications(category) : installApplications(category));
    console.groupEnd();
}

async function installCoreApps(updateOnly: boolean) {
    console.info();
    console.info(chalk.yellowBright('********************************************************************'));
    console.info(chalk.yellowBright('* Installing Core Applications                                    '));
    console.info(chalk.yellowBright('********************************************************************'));
    console.info();

    console.group(chalk.yellowBright('Core'));
    await (updateOnly ? updateApplications('Core') : installApplications('Core'));
    console.groupEnd();
}