import fs from 'fs/promises';

/** Get version from package json */
export const getPackageJsonVersion = () => {
  const packageJson = require(`${process.env.GITHUB_WORKSPACE}/package.json`);

  if (!packageJson.version) {
    throw new Error('No version specified in package.json');
  }

  return packageJson.version;
};

/** Write new version to package json */
export const writePackageJsonVersion = async (newVersion: string) => {
  const packageJson = require(`${process.env.GITHUB_WORKSPACE}/package.json`);
  const json = {
    ...packageJson,
  };

  json.version = newVersion;

  await fs.writeFile(`${process.env.GITHUB_WORKSPACE}}/package.json`, JSON.stringify(json));
};
