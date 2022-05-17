import { exec } from "./cmd";


export function launch(path: string = '.') {
    return exec(`code.exe ${path}`);
}

export function launchDevContainer(devcontainerPath: string = '.', workspaceFile?: string) {
    
    const flag = workspaceFile ? 'file-uri' : 'folder-uri';

    let uri = `vscode-remote://dev-container`;

    return exec(`code.exe --${flag} "${uri}"`);
}