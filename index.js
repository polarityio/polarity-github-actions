const core = require('@actions/core');
const github = require('@actions/github');
const { split, flow, map, trim } = require('lodash/fp');

const getAllReposInOrg = require('./src/getAllReposInOrg');
const uploadActions = require('./src/uploadActions');
const createAndUploadConfigJson = require('./src/createAndUploadConfigJson');

const main = async () => {
  try {
    console.log('Starting Deploy Organization Actions...\n');
    const orgId = core.getInput('org_id');
    const actionFileNames = flow(
      core.getInput,
      split('\n'),
      map(trim)
    )('action_file_names');

    const token = core.getInput('GITHUB_TOKEN');

    const octokit = github.getOctokit(token);

    const allOrgRepos = await getAllReposInOrg(octokit, orgId);

    await uploadActions(octokit, orgId, allOrgRepos, actionFileNames);

    await createAndUploadConfigJson(octokit, orgId, allOrgRepos);
  } catch (error) {
    core.setFailed(error);
  }
};

main();

module.exports = main;
