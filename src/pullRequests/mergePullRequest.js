const { size, map, flow, join, concat } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('../dataTransformations');

const mergePullRequest = async (octokit, orgId, createdPullRequests) => {
  const mergePullRequestFunctions = map(
    mergePullRequestFunction(octokit, orgId),
    createdPullRequests
  );

  console.info(
    size(mergePullRequestFunctions)
      ? '\n\nMerging Pull Requests:'
      : '\n\n*** No Pull Requests Found to Merge ***:\n' +
          '- You may have forgotten to set `should_auto_create_pull_requests: true`'
  );

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const mergePullRequestFunction of mergePullRequestFunctions) {
    await mergePullRequestFunction();
    await sleep(75000);
  }
};

const mergePullRequestFunction =
  (octokit, orgId) =>
  ({ repoName, pullRequest }) =>
  async () => {
    try {
      await octokit.pulls.merge({
        owner: orgId,
        repo: repoName,
        pull_number: pullRequest.number,
        commit_title:
          'Creating Release with Dereferenced Symlinks & No Dev Dependencies for Machine Readability'
      });

      console.info(
        `- Pull Request Merge Success: ${repoName} (https://github.com/polarityio/${repoName}/releases)`
      );
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

const getUnmergedRepos = () => {
  const fs = require('fs');

  const unmergedRepos = JSON.parse(
    fs.readFileSync('src/pullRequests/unmerged-pull-requests.json', 'utf8')
  );

  console.info(
    flow(
      map(
        ({ repoName, pullRequest: { number } }) =>
          `https://github.com/polarityio/${repoName}/pull/${number}`
      ),
      concat('\nUnmerged Pull Requests:'),
      join('\n')
    )(unmergedRepos)
  );

  return unmergedRepos;
};

module.exports = mergePullRequest;
