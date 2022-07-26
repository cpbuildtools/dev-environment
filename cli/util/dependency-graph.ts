import { DepGraph } from "dependency-graph";
import { readdirSync, readFileSync } from "fs";
import type { PackageJson } from 'type-fest';

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

export interface IProject {
  name: string;
  path: string;
  project: string;
  packageFile: string;
  scripts: string[];
}

let _graph_cache: Map<string, DepGraph<IProject>> = new Map();


export function buildDependencyGraph(workspaceDir: string = "./packages") {
  const projects = readdirSync(workspaceDir);
  var depGraph = new DepGraph();
  var projectByDep: Map<string, string> = new Map();
  for (const project of projects) {
    const projectPkgFile = `${workspaceDir}/${project}/package.json`;
    const pkg = readJson(projectPkgFile);
    projectByDep.set(pkg.name, project);
    depGraph.addNode(project, pkg);
  }

  for (const project of projects) {
    const pkg = depGraph.getNodeData(project) as any;
    let dependencies = pkg.dependencies;
    if (dependencies) {
      for (const dep in dependencies) {
        const depProject = projectByDep.get(dep);
        if (depGraph.hasNode(depProject)) {
          depGraph.addDependency(project, depProject);
        }
      }
    }
    dependencies = pkg.devDependencies;
    if (dependencies) {
      for (const dep in dependencies) {
        const depProject = projectByDep.get(dep);
        if (depGraph.hasNode(depProject)) {
          depGraph.addDependency(project, depProject);
        }
      }
    }
    dependencies = pkg.peerDependencies;
    if (dependencies) {
      for (const dep in dependencies) {
        const depProject = projectByDep.get(dep);
        if (depGraph.hasNode(depProject)) {
          depGraph.addDependency(project, depProject);
        }
      }
    }
    const projectPkgFile = `${workspaceDir}/${project}/package.json`;
    depGraph.setNodeData(project, {
      name: pkg.name,
      path: `${workspaceDir}/${project}`,
      project: project,
      packageFile: projectPkgFile,
      scripts: Object.keys(pkg.scripts),
    });
  }
  _graph_cache.set(workspaceDir, depGraph as DepGraph<IProject>);
}

export function getDependencyGraph(workspaceDir: string = "./packages") {
  if (!_graph_cache.has(workspaceDir)) {
    buildDependencyGraph(workspaceDir);
  }
  return _graph_cache.get(workspaceDir)?.clone()!;
}

function projectIdsSortedByDependencies(workspaceDir: string = "./packages") {
  return getDependencyGraph(workspaceDir).overallOrder();
}

export function getProjectsSortedByDependencies(
  workspaceDir: string = "./packages"
) {
  return projectIdsSortedByDependencies(workspaceDir).map((p) =>
    _graph_cache.get(workspaceDir).getNodeData(p)
  );
}

export function getParallelProjectsSortedByDependencies(
  workspaceDir: string = "./packages"
) {
  const graph = getDependencyGraph(workspaceDir);
  const run: IProject[][] = [];

  let nextSet = graph.overallOrder(true).map((p) => graph.getNodeData(p));
  while (nextSet?.length) {
    run.push(nextSet);
    nextSet.forEach((p) => graph.removeNode(p.project));
    nextSet = graph.overallOrder(true).map((p) => graph.getNodeData(p));
  }
  return run;
}
