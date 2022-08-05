import chalk from "chalk";
import { homedir } from "os";
import { Argv } from "yargs";

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

function initialize() {
  console.log(chalk.greenBright("initialize"));
}

// End Command
