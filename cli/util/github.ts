import chalk from "chalk";
import { exec } from "./cmd";

export async function githubLogin(user: string, token: string) {
    console.info(`Attempting to log into github.com with user ${chalk.yellowBright(user)}`);
    const result = await exec(`echo "${token}" | gh auth login --with-token`);
    return !result;
}