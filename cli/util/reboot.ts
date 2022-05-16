import chalk from "chalk";
import inquirer from "inquirer";
import { exit } from "process";
import { exec } from './cmd'


export async function rebootWindows(resumeCommand?: string): Promise<never> {
    await exec(`reg.exe add HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce /v devenvInstaller /d "${resumeCommand}" /f`);
    console.info();
    console.info(chalk.yellow('********************************************************************'))
    console.info(chalk.yellow('* Windows need to be restarted... because windows...               *'))
    console.info(chalk.yellow('*                                                                  *'))
    console.info(chalk.yellow('* Installation will resume after reboot                            *'))
    console.info(chalk.yellow('********************************************************************'))
    console.info();
    const answer = await inquirer.prompt({
        type: 'confirm',
        name: "rebootNow",
        message: "Reboot Now?"
    });
    if (answer.rebootNow) {
        await exec(`shutdown -r -t 0`);
    }
    exit(0);
}