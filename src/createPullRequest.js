const { size, map, get, isEmpty, first } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('./dataTransformations');
const { inspect } = require('util');
const { flow } = require('lodash');

const createPullRquest = async (octokit, orgId, allOrgRepos) => {
  const pullRequestCreationFunctions = map(
    getPullRequestCreationFunction(octokit, orgId),
    allOrgRepos
  );

  if (size(pullRequestCreationFunctions)) console.info('\n\nCreating Pull Requests:');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const pullRequestCreationFunction of pullRequestCreationFunctions) {
    await pullRequestCreationFunction();
    await sleep(20000);
  }
};
const getPullRequestCreationFunction =
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

      const html_url = openPullRequestsExist
        ? flow(first, get('html_url'))(pullRequests)
        : get(
            'data.html_url',
            await octokit.pulls.create({
              owner: orgId,
              repo: repoName,
              title: 'Updating Github Actions & Adding config.json',
              head: 'develop',
              base: 'master'
            })
          );

      console.info(
        `- Pull Request ${
          openPullRequestsExist ? 'Found' : 'Initiation Success'
        }: ${repoName} (${html_url})`
      );
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
