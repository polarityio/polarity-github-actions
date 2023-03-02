const core = require('@actions/core');
const github = require('@actions/github');
const { map, size, get } = require('lodash/fp');

const getAllReposInOrg = require('./src/getAllReposInOrg');
const uploadActions = require('./src/uploadActions');
const createAndUploadConfigJson = require('./src/createAndUploadConfigJson');
const increasePackageJsonVersion = require('./src/increasePackageJsonVersion');
const { createPullRequest, mergePullRequest } = require('./src/pullRequests');

const main = async () => {
  try {
    console.info('Starting Deploy Organization Actions...\n');
    const orgId = core.getInput('org_id');
    const actionFileNames = core.getMultilineInput('action_file_names');
    const repoNamesForTesting = core.getMultilineInput('repository_names_for_testing');

    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);

    const allOrgRepos = size(repoNamesForTesting)
      ? map((name) => ({ name }), repoNamesForTesting)
      : await getAllReposInOrg(octokit, orgId);

    // await uploadActions(octokit, orgId, allOrgRepos, actionFileNames);

    // await createAndUploadConfigJson(octokit, orgId, allOrgRepos);

    await increasePackageJsonVersion(octokit, orgId, allOrgRepos);

    const createdPullRequests = await createPullRequest(octokit, orgId, allOrgRepos);

    await mergePullRequest(octokit, orgId, createdPullRequests);
  } catch (error) {
    core.setFailed(error);
  }
};

main();

module.exports = main;
