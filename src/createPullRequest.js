const { size, map, get, isEmpty, first, compact, flow } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('./dataTransformations');

const createPullRquest = async (octokit, orgId, allOrgRepos) => {
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

  if (size(pullRequestCreationFunctions)) console.info('\n\nCreating Pull Requests:');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const pullRequestCreationFunction of pullRequestCreationFunctions) {
    await pullRequestCreationFunction();
    await sleep(75000);
  }
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

      console.info(`- Pull Request Found: ${repoName} (${html_url})`);
    } catch (error) {
      console.info(`- Pull Request Query Failed: ${repoName}`);
      console.info({
        repoName,
        err: parseErrorToReadableJSON(error),
        errRequest: parseErrorToReadableJSON(error.request),
        errHeaders: parseErrorToReadableJSON(error.headers)
      });

      if (error.status === 403) {
        throw new Error('Hit Rate Limit. Stopping Action...');
      }
    }
  };

const getPullRequestCreationFunction =
  (octokit, orgId) =>
  (repoName) =>
  async () => {
    try {
      const html_url = get(
        'data.html_url',
        await octokit.pulls.create({
          owner: orgId,
          repo: repoName,
          title: 'Updating Github Actions & Adding config.json',
          head: 'develop',
          base: 'master'
        })
      );

      console.info(`- Pull Request Initiation Success: ${repoName} (${html_url})`);
    } catch (error) {
      console.info(`- Pull Request Initiation Failed: ${repoName}`);
      console.info({
        repoName,
        err: parseErrorToReadableJSON(error),
        errRequest: parseErrorToReadableJSON(error.request),
        errHeaders: parseErrorToReadableJSON(error.headers)
      });

      if (error.status === 403) {
        throw new Error('Hit Rate Limit. Stopping Action...');
      }
    }
  };

module.exports = createPullRquest;
