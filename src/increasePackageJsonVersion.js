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
  map,
  size
} = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('./octokitHelpers');

const increasePackageJsonVersion = async (octokit, orgId, allOrgRepos) => {
  const incrementPackageVersionFunctions = map(
    getIncrementPackageVersionFunction(octokit, orgId),
    allOrgRepos
  );

  if (size(incrementPackageVersionFunctions))
    console.info('\n\nIncrementing `package.json` & `package-lock.json` version:');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const incrementPackageVersionFunction of incrementPackageVersionFunctions) {
    await incrementPackageVersionFunction();
  }
};

const getIncrementPackageVersionFunction = (octokit, orgId) => (repoName) => async () => {
  try {
    const newVersion = getIncreasedVersion(
      await getExistingFile({
        octokit,
        repoName: currentRepo.name,
        relativePath: 'package.json'
      })
    );

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

    console.info(`- Successfully Incremented from package.json version (${repoName})\n`);
  } catch (error) {
    console.info(`- Incrementing package.json version Failed: ${repoName}`);
    console.info({
      repoName,
      err: parseErrorToReadableJSON(error),
      errRequest: parseErrorToReadableJSON(error.request || {}),
      errHeaders: parseErrorToReadableJSON(error.headers || {})
    });

    if (error.status === 403) {
      throw new Error('Hit Rate Limit. Stopping Action...');
    }
  }
};

const parseJsonFileContent = flow(parseFileContent, JSON.parse);

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

const increaseSemanticVersionPatch = (originalVersion) =>
  flow(
    split('-'),
    first,
    split('.'),
    (versionArray) => set('2', parseInt(10, last(versionArray)) + 1, versionArray),
    join('.'),
    (nonBetaVersion) =>
      includes('-beta', originalVersion) ? nonBetaVersion + '-beta' : nonBetaVersion
  )(originalVersion);

const getIncreasedVersion = flow(
  parseJsonFileContent,
  get('version'),
  increaseSemanticVersionPatch
);

module.exports = increasePackageJsonVersion;
