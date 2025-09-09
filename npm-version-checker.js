const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const fs = require('fs');

function getAllPackagePaths() {
  const baseDirs = ['packages', 'wallets'];
  const packagePaths = [];

  baseDirs.forEach((dir) => {
    const fullDir = path.resolve(__dirname, dir);
    if (fs.existsSync(fullDir)) {
      fs.readdirSync(fullDir).forEach((subdir) => {
        const pkgJsonPath = path.join(fullDir, subdir, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          packagePaths.push(pkgJsonPath);
        }
      });
    }
  });

  return packagePaths;
}

function getPackageJson(packagePath) {
  const file = readFileSync(path.resolve(packagePath), 'utf8');
  return JSON.parse(file);
}

function getGitTags() {
  try {
    const tags = execSync('git tag', { encoding: 'utf8' })
      .split('\n')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    return tags;
  } catch (e) {
    console.error('Failed to get git tags:', e.message);
    process.exit(1);
  }
}

function fetchNpmVersion(packageName) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json['dist-tags'].latest); // 获取最新发布的版本
          } catch (err) {
            reject(`Failed to parse npm data: ${err.message}`);
          }
        });
      })
      .on('error', (err) => {
        reject(`Request failed: ${err.message}`);
      });
  });
}

async function main() {
  const packagePaths = getAllPackagePaths();
  for (const packagePath of packagePaths) {
    const pkg = getPackageJson(packagePath);
    console.log({
      name: pkg.name,
      version: pkg.version,
      npmVersion: await fetchNpmVersion(pkg.name),
    });
  }
  //   for (const packagePath of packagePaths) {
  //     const pkg = getPackageJson(packagePath);
  //     const packageName = pkg.name;

  //     const npmVersion = await fetchNpmVersion(packageName);
  //     const expectedTag = `${npmVersion}`;
  //     const gitTags = getGitTags();

  //     // console.log(`📦 npm latest version: ${npmVersion}`);
  //     // console.log(`🔖 Checking for Git tag: ${expectedTag}`);

  //     // console.log(`${gitTags} is ${expectedTag}`);

  //     // if (gitTags.includes(expectedTag)) {
  //     //   console.log(
  //     //     `✅ npm version ${npmVersion} has a matching Git tag "${expectedTag}"`
  //     //   );
  //     //   process.exit(0);
  //     // } else {
  //     //   console.error(
  //     //     `❌ npm version ${npmVersion} has NO matching Git tag "${expectedTag}"`
  //     //   );
  //     //   process.exit(1);
  //     // }
  //   }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
