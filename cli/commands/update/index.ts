import { cp, mkdir, rm } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { Argv } from "yargs";
import {
  installApplications,
  updateApplications,
} from "../../util/applications";
import { exec } from "../../util/cmd";
import { configureGithubCli } from "../../util/github";
import { installVSCodeExtension } from "../../util/vscode";

const homePath = homedir();

/**********************************************************
 *  Command
 *********************************************************/

export const command = "update";
export const describe = "Update Dev Env";
export const builder = (yargs: Argv) => {
  return yargs
    .option("cli", {
      type: "boolean",
      description: "Only update the cli",
      default: false,
    })
    .option("update-only", {
      type: "boolean",
      description: "Only update apps don't install new ones",
      default: false,
    })
    .option("core-only", {
      type: "boolean",
      description: "Only update or install core apps",
      default: false,
    });
};

export const handler = async (args: any) => {
  await updateCli();
  if (!args.cli) {
    await updateApps(args.coreOnly, args.updateOnly);
  }
};

// End Command

async function updateCli() {
  var tmpPath = join(homePath, ".tmp");
  var installPath = join(homePath, "devenv-cli");
  await rm(tmpPath, { recursive: true, force: true });
  await exec(`gh repo clone cpbuildtools/dev-environment ${tmpPath}`);
  await rm(installPath, { recursive: true, force: true });
  await mkdir(installPath, { recursive: true });
  await cp(join(tmpPath, "cli"), installPath, { recursive: true, force: true });
  await exec(`pnpm i`, { cwd: installPath });
  await exec(`pnpm link --global`, { cwd: installPath });
  await configureGithubCli();
}

async function updateApps(coreOnly: boolean, updateOnly: boolean) {
  await installApps(coreOnly ? "Core" : "*", updateOnly);
  await installVSCodeExtension("ms-vscode-remote.vscode-remote-extensionpack", {
    force: true,
  });
  await installVSCodeExtension("ms-azuretools.vscode-docker", { force: true });
}

async function installApps(category: string, updateOnly: boolean) {
  await (updateOnly
    ? updateApplications(category)
    : installApplications(category));
}
