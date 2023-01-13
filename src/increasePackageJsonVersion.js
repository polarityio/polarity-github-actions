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
  assign
} = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('./octokitHelpers');

const increasePackageJsonVersion = async (
  octokit,
  orgId,
  [currentRepo, ...allOrgRepos]
) => {
  try {
    if (isEmpty(currentRepo)) return;

    const newVersion = getIncreasedVersion(
      await getExistingFile({
        octokit,
        repoName: currentRepo.name,
        relativePath: 'package.json'
      })
    );

    console.info({
      previousVersion: parseJsonFileContent(
        await getExistingFile({
          octokit,
          repoName: currentRepo.name,
          relativePath: 'package.json'
        })
      ),
      newVersion
    });
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

    return await increasePackageJsonVersion(octokit, orgId, allOrgRepos);
  } catch (error) {
    console.info({
      repoName: currentRepo.name,
      err: parseErrorToReadableJSON(error)
    });
  }
};

const parseJsonFileContent = flow(parseFileContent, JSON.parse);

const updateJsonVersion = (version) => (fileValue) =>
  flow(
    (x) => {
      console.info({ ujvNewVersion: version, fileValue });
      return x;
    },
    parseJsonFileContent,
    (x) => {
      console.info({ parsedFile: x, version });
      return x;
    },
    (fileContentJson) => ({
      name: fileContentJson.name,
      version,
      ...fileContentJson
    }),
    (x) => {
      console.info({
        newVersionShouldBeHere: x,
        stringified: JSON.stringify(x, null, 2),
        version
      });
      return x;
    },
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
