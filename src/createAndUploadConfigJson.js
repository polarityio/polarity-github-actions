const { size, get, flow, replace, filter, includes, map } = require('lodash/fp');
const { REPO_BLOCK_LIST, CONFIG_JSON_REPO_BLOCK_LIST } = require('./constants');
const {
  decodeBase64,
  encodeBase64,
  parseErrorToReadableJSON
} = require('./dataTransformations');

const createAndUploadConfigJson = async (octokit, orgId, allOrgRepos) => {
  const fileCreationFunctions = flow(
    filter(
      (repo) =>
        !includes(repo.name, REPO_BLOCK_LIST.concat(CONFIG_JSON_REPO_BLOCK_LIST)) &&
        !repo.archived &&
        !repo.disabled
    ),
    map(getConfigContentAndCreateJsonVersion(octokit, orgId))
  )(allOrgRepos);

  if (size(fileCreationFunctions)) console.log('\nUploading config.json');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const fileCreationFunction of fileCreationFunctions) {
    await fileCreationFunction();
  }
};

const getConfigContentAndCreateJsonVersion =
  (octokit, orgId) =>
  ({ name: repoName }) =>
  async () => {
    try {
      let configJsContents = get(
        'data.content',
        await octokit.repos.getContent({
          owner: orgId,
          repo: repoName,
          branch: 'develop',
          path: 'config/config.js'
        })
      );
      if (!size(configJsContents)) return;

      configJsContents = flow(
        replace(/\n/g, ''),
        decodeBase64,
        replace('module.exports = ', 'configJsContents = '),
        eval
      )(configJsContents);
      configJsContents = size(configJsContents.customTypes)
        ? {
            ...configJsContents,
            customTypes: map(
              (customType) => ({ ...customType, regex: customType.regex.toString() }),
              configJsContents.customTypes
            )
          }
        : configJsContents;
      configJsContents = encodeBase64(JSON.stringify(configJsContents, null, 2));

      await octokit.repos.createOrUpdateFileContents({
        owner: orgId,
        repo: repoName,
        path: 'config/config.json',
        message: 'Adding config.json',
        branch: 'develop',
        content: configJsContents,
        committer: {
          name: orgId,
          email: 'info@polarity.io'
        },
        author: {
          name: orgId,
          email: 'info@polarity.io'
        }
      });
      console.log(`- Config.json Upload Success: ${repoName}`);
    } catch (error) {
      console.log(`- Config.json Upload Failed: ${repoName}`);
      console.log({ repoName, err: parseErrorToReadableJSON(error) });
    }
  };

module.exports = createAndUploadConfigJson;
