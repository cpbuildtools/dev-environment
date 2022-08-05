import chalk from "chalk";
import { homedir } from "os";
import { Argv } from "yargs";
import {exec} from '@cpbuildtools/dev-container-common';
import path from "path/posix";

const homePath = homedir();

/**********************************************************
 *  Command
 *********************************************************/

export const command = "dc-start <command>";
export const describe = false;

export const builder = (yargs: Argv) => {
  return yargs
    .command(
      "initialize",
      false,
      (builder) => builder,
      (args) => initialize()
    );
};

async function initialize() {
  console.log(chalk.greenBright("initialize"));
  await exec('docker-compose up -d', {cwd: path.join(__dirname, '../../docker-proxy')});
}

// End Command
