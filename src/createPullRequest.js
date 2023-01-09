const { size, map, get } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('./dataTransformations');

const createPullRquest = async (octokit, orgId, allOrgRepos) => {
  const pullRequestCreationFunctions = map(
    getPullRequestCreationFunction(octokit, orgId),
    allOrgRepos
  );

  if (size(pullRequestCreationFunctions)) console.info('\n\nCreating Pull Requests:');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const pullRequestCreationFunction of pullRequestCreationFunctions) {
    await pullRequestCreationFunction();
  }
};
const getPullRequestCreationFunction =
  (octokit, orgId) =>
  ({ name: repoName }) =>
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
      console.info({ repoName, err: parseErrorToReadableJSON(error) });
    }
  };

module.exports = createPullRquest;
