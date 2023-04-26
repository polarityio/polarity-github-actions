const {
  get,
  isEmpty,
  flow,
  first,
  split,
  set,
  parseInt,
  last,
  join,
  includes,
  assign,
  omit,
  replace
} = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('./octokitHelpers');

const removeBetaFromPackageFiles = async (
  octokit,
  orgId,
  [currentRepo, ...allOrgRepos],
  firstRun = true
) => {
  try {
    if (isEmpty(currentRepo)) return;

    if (firstRun)
      console.info('Removing `-beta` from `package.json` & `package-lock.json` version:');

    const version = getVersion(
      await getExistingFile({
        octokit,
        repoName: currentRepo.name,
        relativePath: 'package.json'
      })
    );

    console.info({ version, isGood:includes('-beta', version) });
    if (includes('-beta', version)) {
      const newVersion = replace('-beta', '', version);
      console.info({ newVersion });

      await createOrUpdateFile({
        octokit,
        orgId,
        repoName: currentRepo.name,
        relativePath: 'package.json',
        updatePreviousFile: updateJsonVersion(newVersion)
      });

      await createOrUpdateFile({
        octokit,
        orgId,
        repoName: currentRepo.name,
        relativePath: 'package-lock.json',
        updatePreviousFile: updateJsonVersion(newVersion)
      });
    }
    return await removeBetaFromPackageFiles(octokit, orgId, allOrgRepos, false);
  } catch (error) {
    console.info({
      repoName: currentRepo.name,
      err: parseErrorToReadableJSON(error)
    });
  }
};

const getVersion = flow(parseFileContent, JSON.parse, get('version'));

const updateJsonVersion = (version) => (fileValue) =>
  flow(
    parseJsonFileContent,
    (fileContentJson) => ({
      name: fileContentJson.name,
      version,
      ...omit('version', fileContentJson)
    }),
    (json) => JSON.stringify(json, null, 2)
  )(fileValue);

module.exports = removeBetaFromPackageFiles;
