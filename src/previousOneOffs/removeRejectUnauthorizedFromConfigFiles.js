const { flow, replace, map, size, compact, flatten, uniqBy } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('../dataTransformations');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('../octokitHelpers');

const removeRejectUnauthorizedFromConfigFiles = async (octokit, orgId, allOrgRepos) => {
  const removeRejectUnauthorizedFromConfigFileFunctions = map(
    createRemoveRejectUnauthorizedFromConfigFileFunction(octokit, orgId),
    allOrgRepos
  );

  if (size(removeRejectUnauthorizedFromConfigFileFunctions))
    console.info(
      'Removing `rejectUnauthorized: <boolean>` from `config.js` & `config.json` request options:'
    );

  const reposWithRemovedRejectUnauthorizedFromConfigFile = [];
  // Must run file creation in series due to the common use of the octokit instantiation
  for (const removeRejectUnauthorizedFromConfigFileFunction of removeRejectUnauthorizedFromConfigFileFunctions) {
    reposWithRemovedRejectUnauthorizedFromConfigFile.push(
      await removeRejectUnauthorizedFromConfigFileFunction()
    );
  }
  return flow(compact, flatten, uniqBy('name'))(reposWithRemovedRejectUnauthorizedFromConfigFile);
};

const createRemoveRejectUnauthorizedFromConfigFileFunction =
  (octokit, orgId) => (repo) => async () => {
    const configJsChangedRepos = await removeRejectUnauthorizedFromConfigFile(
      'config.js',
      octokit,
      orgId,
      repo
    );

    const configJsonChangedRepos = await removeRejectUnauthorizedFromConfigFile(
      'config.json',
      octokit,
      orgId,
      repo
    );

    console.info('\n');
    return [].concat(configJsChangedRepos).concat(configJsonChangedRepos);
  };

const removeRejectUnauthorizedFromConfigFile = async (
  configFileName,
  octokit,
  orgId,
  { name: repoName, ...repo }
) => {
  try {
    const configFile = parseFileContent(
      await getExistingFile({
        orgId,
        octokit,
        repoName,
        relativePath: `config/${configFileName}`
      })
    );

    const rejectUnauthorizedNotFound =
      !/([\'\"]{2}(\,|[^\'\"\,])*)(\s*)("*rejectUnauthorized"*\s*:\s*(true|false)\,*)/.test(
        configFile
      );

    if (rejectUnauthorizedNotFound)
      return console.info(
        `- No \`rejectUnauthorized: <boolean>\` found in \`${configFileName}\`: ${repoName}`
      );

    const configFileWithoutRejectUnauthorized = replace(
      /([\'\"]{2}(\,|[^\'\"\,])*)(\s*)("*rejectUnauthorized"*\s*:\s*(true|false)\,*)/,
      '""',
      configFile
    );

    await createOrUpdateFile({
      octokit,
      orgId,
      repoName,
      relativePath: `config/${configFileName}`,
      updatePreviousFile: () => configFileWithoutRejectUnauthorized
    });

    console.info(
      `- Successfully removed \`rejectUnauthorized: <boolean>\` from \`${configFileName}\` (${repoName})`
    );

    return {
      name: repoName,
      ...repo
    };
  } catch (error) {
    console.info(
      `- Removing \`rejectUnauthorized: <boolean>\` from \`${configFileName}\` Failed: ${repoName}`
    );
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

module.exports = removeRejectUnauthorizedFromConfigFiles;
