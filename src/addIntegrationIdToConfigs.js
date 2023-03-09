const { get, isEmpty, flow, split, join, replace } = require('lodash/fp');
const { parseErrorToReadableJSON, decodeBase64 } = require('./dataTransformations');
const { createOrUpdateFile } = require('./octokitHelpers');
const { v1: uuidv1 } = require('uuid');

const namespaceUuid = 'e7b3f248-b56a-465d-aa88-97e6f87657b5';

const addIntegrationIdToConfigs = async (
  octokit,
  orgId,
  [currentRepo, ...allOrgRepos]
) => {
  const repoName = get('name', currentRepo);
  try {
    if (isEmpty(currentRepo)) return;

    const uuidForThisRepository = uuidv1(repoName, namespaceUuid);

    await createOrUpdateFile({
      octokit,
      orgId,
      repoName,
      relativePath: 'config/config.json',
      updatePreviousFile: (currentFile) => {
        const currentFileContent = flow(
          get('data.content'),
          replace(/\n/g, ''),
          decodeBase64
        )(currentFile);

        const fileLines = split('\n', currentFileContent);
        const configFileLinesWithId = [
          ...fileLines.slice(0, 1),
          `  "integrationId": "${uuidForThisRepository}",`,
          ...fileLines.slice(1)
        ];

        return join('\n', configFileLinesWithId);
      }
    });

    console.info(`- Config.json \`integrationId\` Creation Succeeded: ${repoName}`);

    return await addIntegrationIdToConfigs(octokit, orgId, allOrgRepos);
  } catch (error) {
    console.info({
      MESSAGE: `- Config.json \`integrationId\` Creation Failed: ${repoName}`,
      repoName,
      err: parseErrorToReadableJSON(error)
    });
  }
};

module.exports = addIntegrationIdToConfigs;
