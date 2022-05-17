import { extname } from "path";

import { spawn, exec } from 'child_process';

export function launchVSCode(path: string = '.') {
    spawn(`code ${path}`, {shell: true, detached: true, stdio: 'inherit'});
}

export function launchVSCodeDevContainer(containerPath: string = '.', open?: string) {
    const isWS = extname(open) === '.code-workspace';
    const flag = isWS ? 'file-uri' : 'folder-uri';
    const hexPath = Buffer.from(containerPath).toString('hex');
    let uri = `vscode-remote://dev-container+${hexPath}/${open ?? ''}`;
    //return exec(`code --${flag} "${uri}"`);

    spawn(`env && code --${flag} "${uri}"`, {shell: true, detached: false, stdio: 'inherit'}).on('exit', (code) => {
        console.log('code', code ?? 0);
    });

}

/*

export function exec(cmd: string, { cwd }: { cwd?: string } = {}): Promise<number> {
    return new Promise((res, rej) => {
        try {
            const child = spawn(cmd, { shell: true, stdio: 'inherit', cwd, env: process.env });
            child.on('exit', (code) => {
                res(code ?? 0);
            });
        }
        catch (e) {
            rej(e);
        }
    });
}

*/