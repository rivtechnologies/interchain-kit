const fs = require("fs");
const path = require("path");

const folderToIgnore = ["packages/interchain-kit"];

const packagesInPackageFolder = fs.readdirSync("./packages");
const packagesInWallets = fs.readdirSync("./wallets");

const needToInjectDevCommandPackages = [
  ...packagesInPackageFolder.map((n) => path.join("./packages", n)),
  ...packagesInWallets.map((n) => path.join("./wallets", n)),
].filter((n) => !folderToIgnore.includes(n));

needToInjectDevCommandPackages.forEach((packagePath) => {
  const packageJsonPath = path.join(packagePath, "package.json");
  const packageJsonString = fs.readFileSync(packageJsonPath, "utf-8");
  let packageJson = JSON.parse(packageJsonString);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts.dev = `tsc -w --preserveWatchOutput -p tsconfig.esm.json`;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2).concat("\n")
  );
});
