import chalk from "chalk";
import { existsSync } from "fs";
import { InputQuestion, prompt } from "inquirer";
import { homedir } from "os";
import { join } from "path";
import { Argv } from "yargs";
import { run } from "../../util/cmd";
import { dockerLogin } from "../../util/docker";
import { wslEnv } from "../../util/env";
import { setConfig as setGitConfig } from "../../util/git";
import { configureGithubCli, githubLogin } from "../../util/github";
import { readJsonFile, writeJsonFile } from "../../util/json";

const homePath = homedir();
const configPath = join(homePath, "devenv-cli.config.json");
const configDefaultPath = join(__dirname, "./config.default.json");

export type PropertyChangeHandler = (
  action: string,
  value: string | undefined,
  name: string,
  config: any
) => any | Promise<any>;

export const configPropertyChangeHandlers: {
  [property: string]: PropertyChangeHandler;
} = {
  name: (action, value) => setGitConfig("user.name", value ?? ""),
  email: (action, value) => setGitConfig("user.email", value ?? ""),
  github_user: (action, value) => wslEnv("GITHUB_USER", value),
  github_token: async (action, value, name, cfg) => {
    wslEnv("GITHUB_TOKEN", value);
    await dockerLogin("ghcr.io", cfg.github_user, value);
    await dockerLogin("docker.pkg.github.com", cfg.github_user, value);
    await configureGithubCli();
    await githubLogin(cfg.github_user, value);
  },
};

/**********************************************************
 *  Command
 *********************************************************/

export const command = "config [key] [value]";
export const describe = "configure the dev environment";
export const builder = (yargs: Argv) => {
  return yargs
    .command(
      "get <property>",
      "Gets a config property",
      (builder) => builder.positional("property", { type: "string" }),
      (args) => printConfig(args.property)
    )
    .command(
      "set <property> <value>",
      "Sets a config property",
      (builder) =>
        builder
          .positional("property", { type: "string" })
          .positional("value", { type: "string" }),
      (args) => printConfig(args.property, args.value)
    )
    .command(
      "show",
      "Shows the config object",
      (builder) => builder,
      (_) => printConfig()
    )
    .option("set", {
      type: "string",
    })
    .array("set")
    .option("no-interactive", {
      type: "boolean",
      default: false,
    });
};

export const handler = (args: any) => {
  return promptConfig(args.set);
};

// End Command

export async function setArgsToConfig(setValues?: string[]) {
  const config = {};
  const setExps = Array.isArray(setValues)
    ? setValues.map((i) => i.split("="))
    : [];
  setExps.forEach((i) => {
    config[i.shift()] = i.join("=");
  });
  return config;
}

export async function promptConfig(
  setValues?: string[],
  skipPrompt: boolean = false
) {
  let cfg = await config();
  const argCfg = setArgsToConfig(setValues);
  if (!skipPrompt) {
    const q: InputQuestion[] = [
      {
        name: "name",
        type: "input",
        askAnswered: false,
        message: "Your full name:",
        default: argCfg["name"] ?? cfg["name"],
      },
      {
        name: "email",
        type: "input",
        askAnswered: false,
        message: "Your email address:",
        default: argCfg["email"] ?? cfg["email"],
      },
      {
        name: "github_user",
        type: "input",
        askAnswered: false,
        message: "Your github username:",
        default: argCfg["github_user"] ?? cfg["github_user"],
      },
      {
        name: "github_token",
        type: "input",
        askAnswered: false,
        message: "Your github personal access token(PAT):",
        default: argCfg["github_token"] ?? cfg["github_token"],
      },
    ];
    console.info();
    console.info(
      chalk.yellow(
        "********************************************************************"
      )
    );
    console.info(
      chalk.yellow(
        "* User Information                                                 *"
      )
    );
    console.info(
      chalk.yellow(
        "********************************************************************"
      )
    );
    console.info();
    try {
      const answers = await prompt(q, argCfg);
      Object.assign(cfg, answers);
    } catch (e) {
      console.error(e);
    }
  } else {
    Object.assign(cfg, argCfg);
  }

  await saveConfig(cfg);
}

export async function verifyConfig() {
  let cfg = await config();
}

export async function printConfig(key?: string, value?: string) {
  const result = await config(key, value);
  if (typeof key !== "string") {
    console.info(JSON.stringify(result, undefined, 2));
  } else if (typeof value !== "string") {
    console.info(`"${result}"`);
  } else {
    console.info(`"${key}": "${value}"`);
  }
  return result;
}

export async function config(key?: string, value?: string) {
  let cfg: any;
  if (!existsSync(configPath) || !(cfg = await readJsonFile(configPath))) {
    await run(`cp ${configDefaultPath} ${configPath}`);
    cfg = await readJsonFile(configPath);
  }

  if (typeof key !== "string") {
    return cfg;
  } else if (typeof value !== "string") {
    return cfg[key];
  } else {
    cfg[key] = value;
    await saveConfig(cfg);
  }
}

async function saveConfig(newCfg: any) {
  console.info(chalk.grey("Checking config changes..."));
  let cfg: { [k: string]: string } = await config();
  const keys = Object.keys(cfg);
  const newKeys = Object.keys(newCfg);

  const addKeys = newKeys.filter((k) => !~keys.indexOf(k));
  const removeKeys = keys.filter((k) => !~newKeys.indexOf(k));
  const changeKeys = newKeys.filter((k) => {
    const idx = keys.indexOf(k);
    if (idx === -1) {
      return false;
    }
    return cfg[k] !== newCfg[k];
  });

  const changed = addKeys.length + removeKeys.length + changeKeys.length > 0;
  if (changed) {
    console.info(chalk.grey("Saving config..."));
    await handleConfigPropertyChanges("remove", removeKeys, newCfg);
    await handleConfigPropertyChanges("add", addKeys, newCfg);
    await handleConfigPropertyChanges("change", changeKeys, newCfg);
    try {
      await writeJsonFile(configPath, newCfg, 2);
      console.info(chalk.grey("Saved."));
    } catch (e) {
      console.error(e);
    }
  }
}

async function handleConfigPropertyChanges(
  action: "add" | "remove" | "change",
  keys: string[],
  config: { [k: string]: string }
) {
  for (const key of keys) {
    const handler = configPropertyChangeHandlers[key];
    if (handler) {
      await handler(action, config[key], key, config);
    }
  }
}
