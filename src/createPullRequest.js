const { size, map, get } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('./dataTransformations');
const { inspect } = require('util');

const createPullRquest = async (octokit, orgId, allOrgRepos) => {
  const pullRequestCreationFunctions = map(
    getPullRequestCreationFunction(octokit, orgId),
    allOrgRepos
  );

  if (size(pullRequestCreationFunctions)) console.info('\n\nCreating Pull Requests:');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const pullRequestCreationFunction of pullRequestCreationFunctions) {
    await pullRequestCreationFunction();
    await sleep(5000)
  }
};
const getPullRequestCreationFunction =
  (octokit, orgId) =>
  ({ name: repoName }) =>
  async () => {
    try {
      const response = await octokit.pulls.create({
        owner: orgId,
        repo: repoName,
        title: 'Updating Github Actions & Adding config.json',
        head: 'develop',
        base: 'master'
      });

      const html_url = get('data.html_url', response);
      const headers = get('headers', response);

      console.log({ headers });
      console.info(`- Pull Request Initiation Success: ${repoName} (${html_url})`);
    } catch (error) {

      console.info(`- Pull Request Initiation Failed: ${repoName}`);
      console.info({
        repoName,
        error: inspect(error),
        err: parseErrorToReadableJSON(error),
        errRequest: parseErrorToReadableJSON(error.request),
        errHeaders: parseErrorToReadableJSON(error.headers)
      });

      if (error.status === 403) {
        throw new Error("Hit Rate Limit. Stopping Action...")
      }

    }
  };

module.exports = createPullRquest;
