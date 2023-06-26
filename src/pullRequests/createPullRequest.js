const { size, map, get, isEmpty, compact, flow, first } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('../dataTransformations');

const createPullRequest = async (octokit, orgId, allOrgRepos) => {
  const checkForExistingPullRequestFunctions = map(
    getRepoNameWithoutPullRequestFunction(octokit, orgId),
    allOrgRepos
  );
  if (size(checkForExistingPullRequestFunctions))
    console.info('\n\nChecking Pull Request Statuses:');

  // Must run file creation in series due to the common use of the octokit instantiation
  const pullRequestStatuses = [];
  for (const pullRequestCreationFunction of checkForExistingPullRequestFunctions) {
    pullRequestStatuses.push(await pullRequestCreationFunction());
  }

  const reposToCreatePullRequestsOn = compact(pullRequestStatuses);

  const pullRequestCreationFunctions = map(
    getPullRequestCreationFunction(octokit, orgId),
    reposToCreatePullRequestsOn
  );

  if (size(pullRequestCreationFunctions)) console.info('Creating Pull Requests:');

  const createdPullRequests = [];
  // Must run file creation in series due to the common use of the octokit instantiation
  for (const pullRequestCreationFunction of pullRequestCreationFunctions) {
    createdPullRequests.push(await pullRequestCreationFunction());
    await sleep(75000);
  }

  return createdPullRequests;
};

const getRepoNameWithoutPullRequestFunction =
  (octokit, orgId) =>
  ({ name: repoName }) =>
  async () => {
    try {
      const pullRequests = get(
        'data',
        await octokit.pulls.list({
          owner: orgId,
          repo: repoName,
          state: 'open'
        })
      );

      const openPullRequestsExist = !isEmpty(pullRequests);

      if (!openPullRequestsExist) return repoName;

      const html_url = flow(first, get('html_url'))(pullRequests);

      console.info(`- Pull Request Found: ${repoName} (${html_url})`);
    } catch (error) {
      console.info(`- Pull Request Query Failed: ${repoName}`);
      console.info({
        repoName,
        err: parseErrorToReadableJSON(error),
        errRequest: parseErrorToReadableJSON(error.request || {}),
        errHeaders: parseErrorToReadableJSON(error.headers || {})
      });

      if (error.status === 403) {
        throw new Error('Hit Rate Limit. Stopping Action...');
      }
    }
  };

const getPullRequestCreationFunction = (octokit, orgId) => (repoName) => async () => {
  try {
    const pullRequest = get(
      'data',
      await octokit.pulls.create({
        owner: orgId,
        repo: repoName,
        title:
          'Removing rejectUnauthorized from config files',
        body: '',
        head: 'develop',
        //TODO Adapt to main branch as well
        base: 'master'
      })
    );

    const html_url = get('html_url', pullRequest);
    console.info(`- Pull Request Initiation Success: ${repoName} (${html_url})`);

    return { repoName, pullRequest };
  } catch (error) {
    console.info(`- Pull Request Initiation Failed: ${repoName}`);
    console.info({
      repoName,
      err: parseErrorToReadableJSON(error),
      errRequest: parseErrorToReadableJSON(error.request || {}),
      errHeaders: parseErrorToReadableJSON(error.headers || {})
    });

    if (error.status === 403) {
      throw new Error('Hit Rate Limit. Stopping Action...');
    }
  }
};

module.exports = createPullRequest;
