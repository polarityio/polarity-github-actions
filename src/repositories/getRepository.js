const fp = require('lodash/fp');

const getRepository = (octokit, orgId) => async (repoName) => {
  const repository = fp.get(
    'data',
    await octokit.repos.get({
      owner: orgId,
      repo: repoName
    })
  );

  return repository;
};

module.exports = getRepository;
