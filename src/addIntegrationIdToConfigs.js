const { get, isEmpty, flow, split, join, replace } = require('lodash/fp');
const { parseErrorToReadableJSON, decodeBase64 } = require('./dataTransformations');
const { createOrUpdateFile } = require('./octokitHelpers');
const { v1: uuidv1 } = require('uuid');


const addIntegrationIdToConfigs = async (
  octokit,
  orgId,
  [currentRepo, ...allOrgRepos],
  firstRun = true
) => {
  const repoName = get('name', currentRepo);
  try {
    if (isEmpty(currentRepo)) return;
    
    if(firstRun) console.info('\n\nAdding `polarityIntegrationUuid` to `config.json`:')
        
    const uuidForThisRepository = uuidv1();

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
          `  "polarityIntegrationUuid": "${uuidForThisRepository}",`,
          ...fileLines.slice(1)
        ];

        return join('\n', configFileLinesWithId);
      }
    });

    console.info(`- Config.json \`polarityIntegrationUuid\` Creation Succeeded: ${repoName}`);

    return await addIntegrationIdToConfigs(octokit, orgId, allOrgRepos, false);
  } catch (error) {
    console.info({
      MESSAGE: `- Config.json \`polarityIntegrationUuid\` Creation Failed: ${repoName}`,
      repoName,
      err: parseErrorToReadableJSON(error)
    });
  }
};

module.exports = addIntegrationIdToConfigs;
