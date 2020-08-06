const core = require('@actions/core');
const github = require('@actions/github');
const fp = require('lodash/fp');
const fs = require('fs');
const main = async () => {
  try {
    console.log('Starting Deploy Organization Actions...\n');
    const orgId = core.getInput('org_id');
    const actionFileNames = fp.flow(
      core.getInput,
      fp.split('\n'),
      fp.map(fp.trim)
    )('action_file_names');

    const token = core.getInput('GITHUB_TOKEN');

    const octokit = github.getOctokit(token);

    // const allOrgRepos = await getAllRepos(octokit, orgId);

    const fileCreationFunctions = fp.flatMap(
      ({ name: repoName }) =>
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

            console.log(
              JSON.stringify({ repoName, existingFileSha, actionFileName }, null, 2)
            );

            await octokit.repos.createOrUpdateFileContents({
              owner: 'polarityio',
              repo: repoName,
              path: `.github/workflows/${actionFileName}`,
              message: `Uploading Github Action: ${actionFileName}`,
              branch: 'master',
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
          },
          actionFileNames
        ),
      [{ name: 'testing-github-actions' }] //allOrgRepos
    );

    for (const fn of fileCreationFunctions) {
      await fn(); 
    }

    console.log('fileCreationReponses', JSON.stringify(fileCreationReponses, null, 2));
  } catch (error) {
    core.setFailed(error);
  }
};

const getAllRepos = async (octokit, orgId, pageNumber = 1, agg = []) => {
  const repos = fp.getOr(
    [],
    'data',
    await octokit.repos.listForOrg({
      org: orgId,
      per_page: 100,
      page: pageNumber
    })
  );

  if (repos.length < 100) {
    console.log('repos', agg.concat(repos)[0]);
    return agg.concat(repos);
  }

  await getAllRepos(octokit, orgId, pageNumber + 1, agg.concat(repos));
};
main();

module.exports = main;
