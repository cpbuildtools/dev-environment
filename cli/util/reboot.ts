import chalk from "chalk";
import {exec} from './cmd'

export async function rebootWindows(message?: string, resumeCommand?:string) {

    await exec(`reg.exe add HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce /v "!devenv-installer" /d "%temp%\\devenv_intaller.cmd" /f`);

    console.info();
    console.info(chalk.yellow('********************************************************************'))
    console.info(chalk.yellow('* Windows need to be restarted... because windows...               *'))
    console.info(chalk.yellow('*                                                                  *'))
    console.info(chalk.yellow('* Press any key to reboot or crt+c to reboot later                 *'))
    console.info(chalk.yellow('* installation will resume after reboot                            *'))
    console.info(chalk.yellow('********************************************************************'))
    console.info();
    await exec(`pause.exe`);
    await exec(`shutdown -r -t 0`);

}