const { map } = require('lodash');

const { inspect } = require('util');
const createPullRquest = async (octokit, orgId, allOrgRepos) => {
  console.info('Creating Pull Requests: ', '\n');

  const pullRequestCreationFunctions = map(
    getPullRequestCreationFunction(octokit, orgId),
    allOrgRepos
  );

  console.info('Here', { allOrgRepos });
  console.info({
    pullRequestCreationFunctions: inspect(pullRequestCreationFunctions)
  });

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
      console.info('is This Running?');
      const result = await octokit.rest.pulls.create({
        owner: orgId,
        repo: repoName,
        title: 'Updating Github Actions & Adding config.json',
        head: 'develop',
        base: 'master'
      });

      console.info({ result });
      console.info(
        `- Pull Request Initiation Success: ${repoName} (https://github.com/polarityio/${repoName}/pull/${1})`
      );
    } catch (error) {
      console.info(`- Pull Request Initiation Failed: ${repoName}`);
      console.info({ repoName, err: parseErrorToReadableJSON(error) });
    }
  };

module.exports = createPullRquest;
