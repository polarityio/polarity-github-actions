const fp = require('lodash/fp');
const fs = require('fs');
const REPO_BLOCK_LIST = [
  'testing-github-actions',
  'reference-channels',
  'node-maxmind',
  'polarityio.github.io',
  'polarity-github-actions',
  'polarity-integration-development-checklist',
  'securonix'
];

const uploadActions = async (octokit, allOrgRepos, actionFileNames) => {
  console.log('\nAction Files to Upload: ', actionFileNames, '\n');
  
  const fileCreationFunctions = fp.flow(
    fp.filter(
      (repo) =>
        !fp.includes(repo.name, REPO_BLOCK_LIST) && !repo.archived && !repo.disabled
    ),
    fp.flatMap(getDeployFunctionsForActionFilesByRepo(octokit, actionFileNames))
  )(allOrgRepos);

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const fileCreationFunction of fileCreationFunctions) {
    await fileCreationFunction();
  }
};

const getDeployFunctionsForActionFilesByRepo = (octokit, actionFileNames) => ({
  name: repoName
}) =>
  fp.map(
    (actionFileName) => async () => {
      const existingFileSha = await getExistingFileShaHash(
        octokit,
        repoName,
        actionFileName
      );

      await uploadActionFile(octokit, repoName, actionFileName, existingFileSha);

      console.log(`- Action Upload Success: ${repoName} <- ${actionFileName}`);
    },
    actionFileNames
  );

const getExistingFileShaHash = async (octokit, repoName, actionFileName,) =>
  fp.get(
    'data.sha',
    await octokit.repos
      .getContent({
        owner: 'polarityio',
        repo: repoName,
        branch: 'develop',
        path: `.github/workflows/${actionFileName}`
      })
      .catch((error) => {
        if (!error.message.includes('Not Found')) {
          throw error;
        }
      })
  );

const uploadActionFile = (octokit, repoName, actionFileName, existingFileSha) =>
  octokit.repos.createOrUpdateFileContents({
    owner: 'polarityio',
    repo: repoName,
    path: `.github/workflows/${actionFileName}`,
    message: `Uploading Github Action: ${actionFileName}`,
    branch: 'develop',
    ...(existingFileSha && { sha: existingFileSha }),
    content: fs.readFileSync(actionFileName, 'base64'),
    committer: {
      name: 'polarityio',
      email: 'info@polarity.io'
    },
    author: {
      name: 'polarityio',
      email: 'info@polarity.io'
    }
  });

module.exports = uploadActions;