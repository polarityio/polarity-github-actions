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

    await getAllRepos(octokit, orgId);
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
    console.log('repos', fp.map(fp.get('full_name'), agg.concat(repos)).length);
    return agg.concat(repos);
  }

  await getAllRepos(octokit, orgId, pageNumber + 1, agg.concat(repos));
};
main();

module.exports = main;
