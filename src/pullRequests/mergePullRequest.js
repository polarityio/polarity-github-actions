const { size, map, get, isEmpty, compact, flow, first } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('../dataTransformations');

const mergePullRequest = async (octokit, orgId, createdPullRequests) => {
  const mergePullRequestFunctions = map(
    mergePullRequestFunction(octokit, orgId),
    createdPullRequests
  );

  if (size(mergePullRequestFunctions)) console.info('\n\nMerging Pull Requests:');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const mergePullRequestFunction of mergePullRequestFunctions) {
    await mergePullRequestFunction();
    // await sleep(75000);
  }
};

const mergePullRequestFunction =
  (octokit, orgId) =>
  ({ repoName, pullRequest }) =>
  async () => {
    try {
      const data = get(
        'data',
        await octokit.pulls.merge({
          owner: orgId,
          repo: repoName,
          pull_number: pullRequest.number,
          commit_title: 'Creating Release with Dereferenced Symlinks & No Dev Dependencies for Machine Readability'
        })
      );

      console.log(JSON.stringify(data, null, 2))
      console.info(`- Pull Request Merge Success: ${repoName} (${111})`);
    } catch (error) {
      console.info(`- Pull Request Merge Failed: ${repoName}`);
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

module.exports = mergePullRequest;
