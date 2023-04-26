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
  omit
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
      console.info(
        'Removing `-beta` from `package.json` & `package-lock.json` version:'
      );

    const packageJson = parseFileContent(await getExistingFile({
      octokit,
      repoName: currentRepo.name,
      relativePath: 'package.json'
    }));

    console.info({packageJson})

    return await removeBetaFromPackageFiles(octokit, orgId, allOrgRepos, false);
  } catch (error) {
    console.info({
      repoName: currentRepo.name,
      err: parseErrorToReadableJSON(error)
    });
  }
};

module.exports = removeBetaFromPackageFiles;
