import { DepGraph } from "dependency-graph";
import glob from "fast-glob";
import { existsSync } from "fs";
import Enumerable from "linq";
import Path from "path/posix";
import { PackageJson } from "type-fest";
import { exec } from "./cmd";
import { readJsonFile } from "./json";

export class Package {
  public static async load(path: string): Promise<Package> {
    if (Path.basename(path) === "package.json") {
      path = Path.dirname(path);
    }
    path = Path.resolve(path);

    const data = (await readJsonFile(
      Path.join(path, "package.json")
    )) as PackageJson;

    return new Package(path, data);
  }

  private _workspacePackagesQuery?: Promise<Enumerable.IEnumerable<Package>>;

  private readonly _packageManager: "npm" | "yarn" | "pnpm";

  private constructor(
    public readonly path: string,
    public readonly data: PackageJson
  ) {
    if (existsSync(Path.join(path, "package-lock.json"))) {
      this._packageManager = "npm";
    } else if (existsSync(Path.join(path, "yarn.lock"))) {
      this._packageManager = "yarn";
    } else {
      this._packageManager = "pnpm";
    }
  }

  private async _workspacePackagesQueryFactory() {
    const base = Enumerable.from(
      Array.isArray(this.data.workspaces)
        ? this.data.workspaces
        : Array.isArray(this.data.workspaces.packages)
        ? this.data.workspaces.packages
        : []
    ).select((p) => glob(p, { cwd: this.path, onlyDirectories: true }));

    const packages = Enumerable.from(
      await Promise.all(
        Enumerable.from(await Promise.all(base.toArray()))
          .selectMany((paths) => paths)
          .select((p) => Path.join(this.path, p))
          .where((p) => existsSync(Path.join(p, "package.json")))
          .select((p) => Package.load(p))
      )
    ).orderBy((p) => p.name);

    return packages.asEnumerable();
  }

  private get workspacePackagesQuery() {
    return (this._workspacePackagesQuery ??=
      this._workspacePackagesQueryFactory());
  }

  private async _buildWorkspacePackagesDependencyArray(
    opts: PackageDependencyInclusionOptions
  ) {
    const runOrder: Package[][] = [];
    const depGraph = (await this._buildWorkspacePackagesDepGraph(opts)).clone();

    let packages = depGraph
      .overallOrder(true)
      .map((name) => depGraph.getNodeData(name) as Package);

    while (packages?.length) {
      runOrder.push(packages);
      packages.forEach((p) => depGraph.removeNode(p.name));
      packages = depGraph
        .overallOrder(true)
        .map((name) => depGraph.getNodeData(name) as Package);
    }

    return runOrder;
  }

  private async _buildWorkspacePackagesDepGraph(
    opts: PackageDependencyInclusionOptions
  ) {
    const depGraph = new DepGraph();
    const packagesQuery = await this.workspacePackagesQuery;

    packagesQuery.forEach((pkg) => {
      depGraph.addNode(pkg.name, pkg);
    });

    const deps = packagesQuery.select((p) => ({
      name: p.name,
      deps: [
        ...(opts.dependencies === false ? [] : p.dependencyNames),
        ...(opts.devDependencies === false ? [] : p.devDependencyNames),
        ...(opts.peerDependencies === false ? [] : p.peerDependencyNames),
        ...(opts.optionalDependencies === false
          ? []
          : p.optionalDependencyNames),
      ],
    }));

    deps.forEach((p) => {
      p.deps.forEach((d) => {
        depGraph.addDependency(p.name, d);
      });
    });
    return depGraph;
  }

  public get packageManager() {
    return this._packageManager;
  }

  public get isWorkspace() {
    return !!this.data.workspaces;
  }

  public get name() {
    return this.data.name;
  }

  public get version() {
    return this.data.name;
  }

  public get dependencies() {
    return this.data.dependencies ?? {};
  }

  public get devDependencies() {
    return this.data.devDependencies ?? {};
  }

  public get peerDependencies() {
    return this.data.peerDependencies ?? {};
  }

  public get optionalDependencies() {
    return this.data.optionalDependencies ?? {};
  }

  public get dependencyNames() {
    return Object.keys(this.dependencies);
  }

  public get devDependencyNames() {
    return Object.keys(this.devDependencies);
  }

  public get peerDependencyNames() {
    return Object.keys(this.peerDependencies);
  }

  public get optionalDependencyNames() {
    return Object.keys(this.optionalDependencies);
  }

  public async install() {
    switch (this._packageManager) {
      case "npm":
        return await this.installNpm();
      case "yarn":
        return await this.installYarn();
      case "pnpm":
        return await this.installPnpm();
    }
  }

  private async installNpm() {
    return await exec(`npm install`);
  }

  private async installYarn() {
    return await exec(`yarn install`);
  }

  private async installPnpm() {
    return await exec(`pnpm install`);
  }

  public async add(dep: string, depType: "" | "dev" | "optional") {
    switch (this._packageManager) {
      case "npm":
        return await this.addNpm(dep, depType);
      case "yarn":
        return await this.addYarn(dep, depType);
      case "pnpm":
        return await this.addPnpm(dep, depType);
    }
  }

  private async addNpm(dep: string, depType: "" | "dev" | "optional") {
    let flag = "";
    switch (depType) {
      case "":
        flag = "--save";
        break;
      case "dev":
        flag = "--save-dev";
      case "optional":
        flag = "--save-optional";
        break;
    }
    return await exec(`npm i ${dep} ${flag}`);
  }

  private async addYarn(dep: string, depType: "" | "dev" | "optional") {
    let flag = "";
    switch (depType) {
      case "":
        flag = "";
        break;
      case "dev":
        flag = "-D";
        break;
      case "optional":
        flag = "-O";
        break;
    }
    return await exec(`yarn add ${flag} ${dep}`);
  }

  private async addPnpm(dep: string, depType: "" | "dev" | "optional") {
    let flag = "";
    switch (depType) {
      case "":
        flag = "";
        break;
      case "dev":
        flag = "-D";
        break;
      case "optional":
        flag = "-O";
        break;
    }
    return await exec(`pnpm add ${flag} ${dep}`);
  }

  public async remove(dep: string) {
    switch (this._packageManager) {
      case "npm":
        return await this.removeNpm(dep);
      case "yarn":
        return await this.removeYarn(dep);
      case "pnpm":
        return await this.removePnpm(dep);
    }
  }

  private async removeNpm(dep: string) {
    return await exec(`npm uninstall ${dep}`);
  }

  private async removeYarn(dep: string) {
    return await exec(`yarn remove ${dep}`);
  }

  private async removePnpm(dep: string) {
    return await exec(`pnpm remove ${dep}`);
  }

  public async run(cmd: string) {
    switch (this._packageManager) {
      case "npm":
        return await this.runNpm(cmd);
      case "yarn":
        return await this.runYarn(cmd);
      case "pnpm":
        return await this.runPnpm(cmd);
    }
  }

  private async runNpm(cmd: string) {
    return await exec(`npm run ${cmd}`);
  }

  private async runYarn(cmd: string) {
    return await exec(`yarn run ${cmd}`);
  }

  private async runPnpm(cmd: string) {
    return await exec(`pnpm run ${cmd}`);
  }

  private _applyWorkspaceExecuteOptionDefaults(
    options: WorkspaceExecuteOptions
  ) {
    const opt: WorkspaceExecuteOptions = {
      parallel: false,
      dependencyOrder: false,
      ...options,
    };

    if (opt.dependencyOrder === true) {
      opt.dependencyOrder = {
        include: {
          dependencies: true,
          devDependencies: true,
          optionalDependencies: true,
          peerDependencies: true,
        },
      };
    } else if (opt.dependencyOrder === false) {
      opt.dependencyOrder = false;
    } else {
      opt.dependencyOrder = {
        include: {
          dependencies: false,
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: false,
          ...(opt.dependencyOrder?.include ?? {}),
        },
      };
    }
    return opt;
  }

  private async _buildWorkspaceWalkOrder(options: WorkspaceExecuteOptions) {
    let packages: Package[][] = [];

    if (
      typeof options.dependencyOrder === "object" &&
      (options.dependencyOrder.include?.dependencies ||
        options.dependencyOrder.include?.devDependencies ||
        options.dependencyOrder.include?.peerDependencies ||
        options.dependencyOrder.include?.optionalDependencies)
    ) {
      packages = await this._buildWorkspacePackagesDependencyArray(
        options.dependencyOrder.include
      );
      if (!options.parallel) {
        packages = packages.flat().map((p) => [p]);
      }
    } else {
      const q = await this.workspacePackagesQuery;
      if (options.parallel) {
        packages = [q.toArray()];
      } else {
        packages = q.select((p) => [p]).toArray();
      }
    }

    return packages;
  }

  public async workspaceWalk<T, TError = unknown>(
    fn: (pkg: Package) => Promise<T>,
    options: WorkspaceExecuteOptions
  ) {
    options = this._applyWorkspaceExecuteOptionDefaults(options);
    const order = await this._buildWorkspaceWalkOrder(options);

    const results: (WorkspaceWalkSuccess<T> | WorkspaceWalkError<TError>)[] =
      [];

    for (const seq of order) {
      const pp: Promise<WorkspaceWalkSuccess<T> | WorkspaceWalkError<TError>>[] = [];
      for (const para of seq) {
        const fnWrapper = async (pkg:Package) =>{
          try{
            const result = await fn(pkg);
            return {
              package: pkg,
              result: result as T,
              success: true
            } as WorkspaceWalkSuccess<T>;
          }catch(e){
            return {
              package: pkg,
              result: e,
              success: false
            } as WorkspaceWalkError<TError>;
          }
        }
        const p = fnWrapper(para);
        pp.push(p);
      }
      const r = Enumerable.from(await Promise.allSettled(pp)).select(r => r.status === 'fulfilled' ? r.value : r.reason).toArray();
      results.push(...r);
    }

    const rq = Enumerable.from(results);
    const rError = rq
      .where((r) => !r.success)
      .select((r: WorkspaceWalkError<TError>) => r);
    const rSuccess = rq
      .where((r) => r.success)
      .select((r: WorkspaceWalkSuccess<T>) => r);

    return {
      hasErrors: rError.any(),
      errors: rError.toArray(),
      results: rSuccess.toArray(),
    };
  }
  public async workspaceExecute(cmd: string, options: WorkspaceExecuteOptions) {
    options = this._applyWorkspaceExecuteOptionDefaults(options);
    console.log("options:", options);
    const order = this._buildWorkspaceWalkOrder(options);

    return order;
  }

  public workspaceRun(cmd: string, options: WorkspaceRunOptions) {
    options = {
      order: "sequential",
      dependenciesToOrder: true,
      ...options,
    };

    if (options.dependenciesToOrder === true) {
      options.dependenciesToOrder = {
        dependencies: true,
        peerDependencies: true,
        devDependencies: true,
        optionalDependencies: true,
      };
    } else if (options.dependenciesToOrder === true) {
      options.dependenciesToOrder = {
        dependencies: false,
        peerDependencies: false,
        devDependencies: false,
        optionalDependencies: false,
      };
    } else {
      options.dependenciesToOrder = {
        dependencies: true,
        peerDependencies: true,
        devDependencies: true,
        optionalDependencies: true,
        ...options.dependenciesToOrder,
      };
    }
  }
}

export interface WorkspaceWalkResult<T = unknown> {
  package:Package;
  success: boolean;
  result: T;
}

export interface WorkspaceWalkSuccess<T> extends WorkspaceWalkResult<T> {
  success: true;
}

export interface WorkspaceWalkError<T = unknown>
  extends WorkspaceWalkResult<T> {
  success: false;
}

export function isWorkspaceWalkSuccess<T>(
  obj: any
): obj is WorkspaceWalkSuccess<T> {
  return typeof obj === "object" ? obj.success === true : false;
}

export function isWorkspaceWalkError<T>(
  obj: any
): obj is WorkspaceWalkError<T> {
  return typeof obj === "object" ? obj.success === false : false;
}

export interface WorkspaceExecuteOptions {
  parallel?: boolean;
  dependencyOrder?: boolean | WorkspaceOrderOptions;
}

export interface WorkspaceOrderOptions {
  include: PackageDependencyInclusionOptions;
}

export interface WorkspaceRunOptions {
  order?:
    | "sequential"
    | "parallel"
    | "dependencySequential"
    | "dependencyParallel";
  dependenciesToOrder?: boolean | PackageDependencyInclusionOptions;
}

export interface PackageDependencyInclusionOptions {
  dependencies?: boolean;
  devDependencies?: boolean;
  optionalDependencies?: boolean;
  peerDependencies?: boolean;
}

/*
export class Workspace {
  public static async load(path: string): Promise<Workspace> {
    const data = (await Package.load(path)) as Package;
    return new Workspace(data);
  }

  private readonly package: Package;

  constructor(data: Package);
  constructor(data: PackageJson, path: string);
  constructor(data: PackageJson | Package, path?: string) {
    this.package = data instanceof Package ? data : new Package(path, data);
  }
}
*/
