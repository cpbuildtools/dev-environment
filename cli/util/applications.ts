import Enumerable from 'linq';
import { update, updateOrInstall } from './winget';

interface IApplication {
    id: string;
    name: string;
    description?: string;
    required: boolean;
    category: "Core";
    source: 'winget' | 'apt';
}


const baseApplications: IApplication[] = [
    {
        id: 'Microsoft.VisualStudioCode',
        name: 'Microsoft Visual Studio Code',
        description: 'Microsoft Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications. Microsoft Visual Studio Code is free and available on your favorite platform - Linux, macOS, and Windows.',
        required: true,
        category: "Core",
        source: 'winget'
    },
    {
        id: 'Docker.DockerDesktop',
        name: 'Docker Desktop',
        description: 'Docker Desktop is an application for macOS and Windows machines for the building and sharing of containerized applications. Access Docker Desktop and follow the guided onboarding to build your first containerized application in minutes.',
        required: true,
        category: "Core",
        source: 'winget'
    },
    {
        id: 'Canonical.Ubuntu.2004',
        name: 'Ubuntu 20.04',
        description: 'Ubuntu on Windows allows you to use Ubuntu Terminal and run Ubuntu command line utilities including bash, ssh, git, apt and many more.',
        required: true,
        category: "Core",
        source: 'winget'
    },
    {
        id: 'GitHub.cli',
        name: 'GitHub CLI',
        description: 'GitHubs official command-line tool.',
        required: true,
        category: "Core",
        source: 'winget'
    }
];


export async function getApplicationsToInstall(): Promise<IApplication[]> {
    return [...baseApplications];
}

export async function installApplications(category: string = '*') {
    const apps = Enumerable.from(await getApplicationsToInstall()).where(a => category === a.category || category === '*');
    for (const install of apps.toArray()) {
        switch (install.source) {
            case 'winget':
                await updateOrInstall(install.id);
                break;
            case 'apt':
                break;
        }
    }
}

export async function updateApplications(category: string = '*') {
    const apps = Enumerable.from(await getApplicationsToInstall()).where(a => category === a.category || category === '*');
    for (const install of apps.toArray()) {
        switch (install.source) {
            case 'winget':
                await update(install.id);
                break;
            case 'apt':
                break;
        }
    }
}

export async function installCoreApplications() {
    await installApplications("Core");
}

export async function updateCoreApplications() {
    await updateApplications("Core");
}