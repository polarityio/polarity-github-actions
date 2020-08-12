const fp = require('lodash/fp');
const fs = require('fs');
const REPO_BLOCK_LIST = [
  'testing-github-actions',
  'reference-channels',
  'node-maxmind',
  'polarityio.github.io',
  'polarity-github-actions',
  'polarity-integration-development-checklist'
];

const uploadActions = async (octokit, allOrgRepos, actionFileNames) => {
  console.log('\nAction Files to Upload: ', actionFileNames, '\n');
  const fileCreationFunctions = fp.flow(
    fp.filter((repo) => fp.includes(repo.name, REPO_BLOCK_LIST)),
    fp.flatMap(({ name: repoName }) =>
      fp.map(
        (actionFileName) => async () => {
          const existingFileSha = fp.get(
            'data.sha',
            await octokit.repos
              .getContent({
                owner: 'polarityio',
                repo: repoName,
                path: `.github/workflows/${actionFileName}`
              })
              .catch((error) => {
                if (!error.message.includes('Not Found')) {
                  throw error;
                }
              })
          );

          await octokit.repos.createOrUpdateFileContents({
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

          console.log(`- Action Upload Success: ${repoName} <- ${actionFileName}`);
        },
        actionFileNames
      )
    )
  )(['repo-names']);

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const fn of fileCreationFunctions) {
    await fn();
  }
};

module.exports = uploadActions;