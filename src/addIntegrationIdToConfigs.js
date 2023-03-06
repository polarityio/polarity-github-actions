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
  findIndex
} = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('./octokitHelpers');
const { v5: uuidv5 } = require('uuid');

const namespaceUuid = 'e7b3f248-b56a-465d-aa88-97e6f87657b5';

const addIntegrationIdToConfigs = async (
  octokit,
  orgId,
  [currentRepo, ...allOrgRepos]
) => {
  try {
    if (isEmpty(currentRepo)) return;

    const uuidForThisRepository = uuidv5(currentRepo.name, namespaceUuid);

    await createOrUpdateFile({
      octokit,
      orgId,
      repoName: currentRepo.name,
      relativePath: 'config/config.js',
      updatePreviousFile: (currentFileContent) => {
        const fileLines = split('\n', currentFileContent)
        const indexOfLineToPutIdBelow = findIndex(includes('module.exports'), fileLines) + 1;
        const configFileLinesWithId = [
          ...fileLines.slice(0, indexOfLineToPutIdBelow),
          `  integrationId: '${uuidForThisRepository}',`,
          ...fileLines.slice(indexOfLineToPutIdBelow)
        ];

        return join('\n', configFileLinesWithId);
      }
    });

    await createOrUpdateFile({
      octokit,
      orgId,
      repoName: currentRepo.name,
      relativePath: 'config/config.json',
      updatePreviousFile: (currentFileContent) => {
        const fileLines = split('\n', currentFileContent)
        const configFileLinesWithId = [
          ...fileLines.slice(0, 1),
          `  "integrationId": "${uuidForThisRepository}",`,
          ...fileLines.slice(1)
        ];

        return join('\n', configFileLinesWithId);
      }
    });

    return await addIntegrationIdToConfigs(octokit, orgId, allOrgRepos);
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

module.exports = addIntegrationIdToConfigs;
