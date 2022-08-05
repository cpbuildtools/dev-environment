import chalk from "chalk";
import { homedir } from "os";
import { Argv } from "yargs";

const homePath = homedir();

/**********************************************************
 *  Command
 *********************************************************/

export const command = "dv-startup <command>";
export const describe = false;

export const builder = (yargs: Argv) => {
  return yargs
    .command(
      "initialize",
      false,
      (builder) => builder,
      (args) => initialize()
    )
    .command(
      "onCreate",
      false,
      (builder) => builder,
      (args) => onCreate()
    )
    .command(
      "updateContent",
      false,
      (builder) => builder,
      (args) => updateContent()
    )
    .command(
      "postCreate",
      false,
      (builder) => builder,
      (args) => postCreate()
    )
    .command(
      "postStart",
      false,
      (builder) => builder,
      (args) => postStart()
    )
    .command(
      "postAttach",
      false,
      (builder) => builder,
      (args) => postAttach()
    );
};

function initialize() {
  console.log(chalk.greenBright("initialize"));
}
function onCreate() {
  console.log(chalk.greenBright("onCreate"));
}
function updateContent() {
  console.log(chalk.greenBright("updateContent"));
}
function postCreate() {
  console.log(chalk.greenBright("postCreate"));
}
function postStart() {
  console.log(chalk.greenBright("postStart"));
}
function postAttach() {
  console.log(chalk.greenBright("postAttach"));
}

// End Command
