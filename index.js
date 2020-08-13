const core = require('@actions/core');
const github = require('@actions/github');
const fp = require('lodash/fp');

const getAllReposInOrg = require('./getAllReposInOrg');
const uploadActions = require('./uploadActions');

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

    const allOrgRepos = await getAllReposInOrg(octokit, orgId);

    console.log('REPOS: ', { allOrgRepos })
    await uploadActions(octokit, allOrgRepos, actionFileNames);
    
  } catch (error) {
    core.setFailed(error);
  }
};


main();

module.exports = main;
