import { Package } from "../util/package-managers";

(async () => {
  let pkg = await Package.load("./test-env");
  console.log(pkg);
  if (pkg.isWorkspace) {
    const r = await pkg.workspaceWalk(
      async (pkg) => {
        console.log("RUN!:", pkg.name);
        if (Math.random() > 0.5) {
          throw new Error("random error");
        }
        return pkg.name;
      },
      {
        parallel: true,
        dependencyOrder: true,
      }
    );
    console.log(r);
  }
})();
