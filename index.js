const core = require('@actions/core');
const github = require('@actions/github');
const { map, size, get } = require('lodash/fp');

const getAllReposInOrg = require('./src/getAllReposInOrg');
const uploadActions = require('./src/uploadActions');
const createAndUploadConfigJson = require('./src/createAndUploadConfigJson');
const increasePackageJsonVersion = require('./src/increasePackageJsonVersion');
const { createPullRequest, mergePullRequest } = require('./src/pullRequests');
const addIntegrationIdToConfigs = require('./src/addIntegrationIdToConfigs');

/** Useful Snippets
 * These are snippets that have been used in the past but aren't used often enough
 * to justify creating an Action File Input Flag (i.e. `core.getInput('<action-file-input>')`)
 * to toggle from the Action File.
 * 
 * Initial Creation of the `config/config.json` files:  
 * await createAndUploadConfigJson(octokit, orgId, allOrgRepos);
 * 
 * When making changes to the values of the GitHub Action Files 
 * that Exist on Each Repository:
 * await uploadActions(octokit, orgId, allOrgRepos, actionFileNames);
 * 
*/

const main = async () => {
  try {
    console.info('Starting Deploy Organization Actions...\n');
    const orgId = core.getInput('org_id');
    const actionFileNames = core.getMultilineInput('action_file_names');
    const shouldAutoCreatePullRequests = core.getInput('should_auto_create_pull_requests');
    const shouldAutoMergePullRequests = core.getInput('should_auto_merge_pull_requests');
    const repoNamesForTesting = core.getMultilineInput('repository_names_for_testing');

    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);

    const allOrgRepos = size(repoNamesForTesting)
      ? map((name) => ({ name }), repoNamesForTesting)
      : await getAllReposInOrg(octokit, orgId);

    await increasePackageJsonVersion(octokit, orgId, allOrgRepos);
    await addIntegrationIdToConfigs(octokit, orgId, allOrgRepos);

    let createdPullRequests = []
    if(shouldAutoCreatePullRequests)
      createdPullRequests = await createPullRequest(octokit, orgId, allOrgRepos);

    if(shouldAutoMergePullRequests)
      await mergePullRequest(octokit, orgId, createdPullRequests);

  } catch (error) {
    core.setFailed(error);
  }
};

main();

module.exports = main;
