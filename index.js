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

    console.log(JSON.stringify({ orgId, actionFileNames }, null, 2));

    const token = core.getInput('GITHUB_TOKEN');

    const octokit = github.getOctokit(token);
    
    const repo = fp.get('context.payload.repository', github);

    console.log('type of path', {
      owner: repo.owner.login,
      repo: repo.name,
      repoContents: repo
    });
    // const allOrgRepos = await getAllRepos(octokit, orgId);

    const fileCreationReponses = await Promise.all(
      fp.flatMap(
        ({ name: repoName }) =>
          fp.map(
            (actionFileName) =>
              octokit.repos.createOrUpdateFileContents({
                owner: 'polarityio',
                repo: repoName,
                path: `.github/workflows/${actionFileName}`,
                message: `Uploading Github Action: ${actionFileName}`,
                branch: 'master',
                content: new Buffer('name: Testing Again?').toString('base64'),
                committer: {
                  name: 'polarityio',
                  email: 'info@polarity.io'
                },
                author: {
                  name: 'polarityio',
                  email: 'info@polarity.io'
                }
              }),
            ['test-file-upload.yml'] //actionFileNames
          ),
        [{ name: 'testing-github-actions' }] //allOrgRepos
      )
    );


    console.log('fileCreationReponses', fileCreationReponses);

  } catch (error) {
    core.setFailed(error.message);
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
