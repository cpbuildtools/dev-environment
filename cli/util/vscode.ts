import { extname } from "path";

import { spawn } from 'child_process';
import { translateWslPath } from "./wsl";

export function launchVSCode(path: string = '.') {
    spawn(`code ${path}`, { shell: true, detached: true, stdio: 'ignore' });
}

export async function launchVSCodeDevContainer(containerPath: string = '.', open?: string) {
    const isWS = extname(open ?? '') === '.code-workspace';
    const flag = isWS ? 'file-uri' : 'folder-uri';
    const hexPath = Buffer.from(await translateWslPath(containerPath)).toString('hex');
    let uri = `vscode-remote://dev-container+${hexPath}/${open ?? ''}`;
    const cmd = `code --${flag} "${uri}"`;
    spawn(cmd, { shell: true, detached: true, stdio: 'ignore' });
}
