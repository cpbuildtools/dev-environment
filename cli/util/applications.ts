import Enumerable from 'linq';
import { update, updateOrInstall } from './winget';

interface IApplication {
    id: string;
    name: string;
    description?: string;
    required: boolean;
    category: string;
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
    },
    {
        id: 'Microsoft.WindowsTerminal',
        name: 'Windows Terminal',
        description: 'The new Windows Terminal, a tabbed command line experience for Windows.',
        required: false,
        category: "Utils",
        source: 'winget'
    },
    {
        id: 'Google.Chrome',
        name: 'Google Chrome',
        description: 'A fast, secure, and free web browser built for the modern web. Chrome syncs bookmarks across all your devices, fills out forms automatically, and so much more.',
        required: false,
        category: "Browsers",
        source: 'winget'
    },
    {
        id: 'Google.Chrome.Dev',
        name: 'Google Chrome',
        description: 'Google Chrome for developers',
        required: false,
        category: "Browsers",
        source: 'winget'
    },
    {
        id: 'Mozilla.Firefox',
        name: 'Mozilla Firefox',
        description: 'Mozilla Firefox is free and open source software, built by a community of thousands from all over the world.',
        required: false,
        category: "Browsers",
        source: 'winget'
    },
    {
        id: 'Mozilla.Firefox.DeveloperEdition',
        name: 'Firefox Developer Edition',
        description: 'Firefox Developer Edition is the blazing fast browser that offers cutting edge developer tools and latest features like CSS Grid support and framework debugging.',
        required: false,
        category: "Browsers",
        source: 'winget'
    },
    {
        id: 'dbeaver.dbeaver',
        name: 'DBeaver Community Edition',
        description: 'Windows database management application with support for most popular dbs',
        required: false,
        category: "Databases",
        source: 'winget'
    }
];


export async function getApplicationsToInstall(): Promise<IApplication[]> {
    return [...baseApplications];
}

export async function installApplications(category: string = '*') {
    const apps = Enumerable.from(await getApplicationsToInstall()).where(matchCatSearch(category));
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

function matchCatSearch(matches: string) {
    return (app: IApplication) => {
        if (app.category === matches || matches === '*') {
            return true;
        }
        if (matches.startsWith('!')) {
            const m = matches.substring(1);
            if (app.category !== m) {
                return true;
            }
        }
        return false;
    };
}

export async function updateApplications(category: string = '*') {
    const apps = Enumerable.from(await getApplicationsToInstall())
        .where(matchCatSearch(category));
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