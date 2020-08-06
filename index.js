const core = require('@actions/core');
const github = require('@actions/github');
const fp = require('lodash/fp');

const main = async () => {
  try {
    console.log('Starting Deploy Organization Actions...\n');
    const orgId = core.getInput('org_id');
    const actionFileNames = fp.flow(
      fp.split('\n'),
      fp.map(fp.trim)
    )(core.getInput('action_file_names'));

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

    // const repoNames = fp.map(fp.get('full_name'), allOrgRepos);

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
