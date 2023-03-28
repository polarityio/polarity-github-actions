const core = require('@actions/core');
const github = require('@actions/github');
const { map, size, get, flow, filter, join } = require('lodash/fp');

const getAllReposInOrg = require('./src/getAllReposInOrg');
const uploadActions = require('./src/uploadActions');
const createAndUploadConfigJson = require('./src/createAndUploadConfigJson');
const increasePackageJsonVersion = require('./src/increasePackageJsonVersion');
const { createPullRequest, mergePullRequest } = require('./src/pullRequests');
const addIntegrationIdToConfigs = require('./src/addIntegrationIdToConfigs');

const main = async () => {
  try {
    console.info('Starting Deploy Organization Actions...\n');
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);

    const orgId = core.getInput('org_id');
    const actionFileNames = core.getMultilineInput('action_file_names');
    const repoNamesForTesting = core.getMultilineInput('repository_names_for_testing');

    const allOrgRepos = size(repoNamesForTesting)
      ? map((name) => ({ name }), repoNamesForTesting)
      : await getAllReposInOrg(octokit, orgId);

    /** Add one-off functions to run here */

    /** Feature Flagged Features */
    // if (core.getBooleanInput('increment_package_json_version'))
    //   await increasePackageJsonVersion(octokit, orgId, allOrgRepos);

    // let createdPullRequests = [];
    // if (core.getBooleanInput('should_auto_create_pull_requests'))
    //   createdPullRequests = await createPullRequest(octokit, orgId, allOrgRepos);

    const createdPullRequests = []
    // if (core.getBooleanInput('should_auto_merge_pull_requests'))
      await mergePullRequest(octokit, orgId, createdPullRequests);
  } catch (error) {
    core.setFailed(error);
  }
};

/** Useful Snippets
 * These are snippets that have been used in the past but aren't used often enough
 * to justify creating an Action File Input Flag (i.e. `core.getBooleanInput('increment_package_json_version')`)
 * to toggle from the Action File.
 *
 * Initial Creation of the `config/config.json` files:
 * await createAndUploadConfigJson(octokit, orgId, allOrgRepos);
 *  
 * Initial Creation of the `polarityIntegrationUuid` field in the `config/config.json`:
 * await addIntegrationIdToConfigs(octokit, orgId, allOrgRepos);

 *
 * When making changes to the values of the GitHub Action Files
 * that Exist on Each Repository:
 * await uploadActions(octokit, orgId, allOrgRepos, actionFileNames);
 *
 */

main();

module.exports = main;
