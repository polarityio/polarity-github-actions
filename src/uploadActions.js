const fs = require('fs');
const { flatMap, map, get, size } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');

const uploadActions = async (octokit, orgId, allOrgRepos, actionFileNames) => {
  const fileCreationFunctions = flatMap(
    getDeployFunctionsForActionFilesByRepo(octokit, orgId, actionFileNames),
    allOrgRepos
  );

  if (size(fileCreationFunctions))
    console.info('* Action Files to Upload: ', actionFileNames);

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const fileCreationFunction of fileCreationFunctions) {
    await fileCreationFunction();
  }
};

const getDeployFunctionsForActionFilesByRepo =
  (octokit, orgId, actionFileNames) =>
  ({ name: repoName }) =>
    map(
      (actionFileName) => async () => {
        try {
          const existingFileSha = await getExistingFileShaHash(
            octokit,
            orgId,
            repoName,
            actionFileName
          );
  
          await uploadActionFile(octokit, orgId, repoName, actionFileName, existingFileSha);
  
          console.info(
            `- Action Upload Success: ${repoName} <- ${actionFileName}  (https://github.com/polarityio/${repoName}/blob/develop/.github/workflows/${actionFileName})`
          );
        } catch (error) {
          console.info(`- Action Upload Failed: ${repoName}`);
          console.info({
            repoName,
            err: parseErrorToReadableJSON(error),
            errRequest: parseErrorToReadableJSON(error.request || {}),
            errHeaders: parseErrorToReadableJSON(error.headers || {})
          });
        }
      },
      actionFileNames
    );

const getExistingFileShaHash = async (octokit, orgId, repoName, actionFileName) =>
  get(
    'data.sha',
    await octokit.repos
      .getContent({
        owner: orgId,
        repo: repoName,
        ref: 'develop',
        path: `.github/workflows/${actionFileName}`
      })
      .catch((error) => {
        if (!error.message.includes('Not Found')) {
          throw error;
        }
      })
  );

const uploadActionFile = (octokit, orgId, repoName, actionFileName, existingFileSha) =>
  octokit.repos.createOrUpdateFileContents({
    owner: orgId,
    repo: repoName,
    branch: 'develop',
    path: `.github/workflows/${actionFileName}`,
    ...(existingFileSha && { sha: existingFileSha }),

    message: `Updated Github Action: ${actionFileName}`,
    content: fs.readFileSync(`./src/individualRepoActions/${actionFileName}`, 'base64'),
    committer: {
      name: orgId,
      email: 'info@polarity.io'
    },
    author: {
      name: orgId,
      email: 'info@polarity.io'
    }
  });

module.exports = uploadActions;
