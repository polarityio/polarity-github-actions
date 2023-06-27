const core = require('@actions/core');
const github = require('@actions/github');
const { map, size, join } = require('lodash/fp');

const getAllReposInOrg = require('./src/repositories/getAllReposInOrg');
const getRepository = require('./src/repositories/getRepository');
const increasePackageJsonVersion = require('./src/increasePackageJsonVersion');
const { createPullRequest, mergePullRequest } = require('./src/pullRequests');
const removeRejectUnauthorizedFromConfigFiles = require('./src/previousOneOffs/removeRejectUnauthorizedFromConfigFiles');

const main = async () => {
  try {
    console.info('Running Organization Actions...\n');
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);

    const orgId = core.getInput('org_id');
    const actionFileNames = core.getMultilineInput('action_file_names');
    const repoNamesForTesting = core.getMultilineInput('repository_names_for_testing');

    let allOrgRepos = size(repoNamesForTesting)
      ? await Promise.all(map(getRepository(octokit, orgId), repoNamesForTesting))
      : await getAllReposInOrg(octokit, orgId);

    console.info(`Number of Repos Found: ${size(allOrgRepos)}`);
    console.info(`Running on:\n${join(', ', map('name', allOrgRepos))}`);

    /** Add one-off functions to run here */
    // const changedRepos = await removeRejectUnauthorizedFromConfigFiles(
    //   octokit,
    //   orgId,
    //   allOrgRepos
    // );

    // console.info(JSON.stringify(changedRepos, null, 2));
    /** Feature Flagged Features */
    if (core.getBooleanInput('increment_package_json_version'))
      await increasePackageJsonVersion(octokit, orgId, allOrgRepos);

    let createdPullRequests = [];
    if (core.getBooleanInput('should_auto_create_pull_requests'))
      createdPullRequests = await createPullRequest(octokit, orgId, allOrgRepos);

    if (core.getBooleanInput('should_auto_merge_pull_requests'))
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
 * When making changes to the values of the GitHub Action Files
 * that Exist on Each Repository:
 * await uploadActions(octokit, orgId, allOrgRepos, actionFileNames);
 *
 */

main();

module.exports = main;
