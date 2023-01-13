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
    (x) => {console.info({ ujvNewVersion: version, fileValue });return x;},
    parseJsonFileContent,
    (x) => {console.info({ parsedFile: x });return x;},
    (fileContentJson) => ({
      name: fileContentJson.name,
      version,
      ...fileContentJson
    }),
    (json) => JSON.stringify(json, null, 2)
  )(fileValue);

const increaseSemanticVersionPatch = (originalVersion) =>
  flow(
    (x) => {
      console.info({ isvporiginalVersion: x });
      return x;
    },
    split('-'),
    (x) => {
      console.info({ isvpsplitDash: x });
      return x;
    },
    first,
    (x) => {
      console.info({ isvpfirst: x });
      return x;
    },
    split('.'),
    (x) => {
      console.info({ isvpsplitDot: x });
      return x;
    },
    (versionArray) => set('2', parseInt(10, last(versionArray)) + 1, versionArray),
    (x) => {
      console.info({ isvpparseNewVersion: x });
      return x;
    },
    join('.'),
    (x) => {
      console.info({ isvpjoinDot: x });
      return x;
    },
    (nonBetaVersion) =>
      includes('-beta', originalVersion) ? nonBetaVersion + '-beta' : nonBetaVersion
  )(originalVersion);

const getIncreasedVersion = flow(
  parseJsonFileContent,
  get('version'),
  increaseSemanticVersionPatch
);

module.exports = increasePackageJsonVersion;
