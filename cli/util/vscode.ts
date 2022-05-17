import { extname } from "path";
import { exec } from "./cmd";


export function launchVSCode(path: string = '.') {
    return exec(`code ${path}`);
}

export function launchVSCodeDevContainer(containerPath: string = '.', open?: string) {
    const isWS = extname(open) === '.code-workspace';
    const flag = isWS ? 'file-uri' : 'folder-uri';
    const hexPath = Buffer.from(containerPath).toString('hex');
    let uri = `vscode-remote://dev-container+${hexPath}/${open ?? ''}`;
    return exec(`code --${flag} "${uri}"`);
}