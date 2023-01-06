const fp = require('lodash/fp');
const { REPOSITORY_DEPLOY_BLOCK_LIST } = require('./constants');

const getAllReposInOrg = async (octokit, orgId, pageNumber = 1, agg = []) => {
  const repos = fp.getOr(
    [],
    'data',
    await octokit.repos.listForOrg({
      org: orgId,
      per_page: 100,
      page: pageNumber
    })
  );

  if (repos.length < 100) {
    const allReposInOrg = agg.concat(repos);
    console.info('Number of Repos Found: ', allReposInOrg.length);

    return fp.filter(
      (repo) => !fp.includes(repo.name, REPOSITORY_DEPLOY_BLOCK_LIST) && !repo.archived && !repo.disabled,
      allReposInOrg
    );
  }

  return await getAllReposInOrg(octokit, orgId, pageNumber + 1, agg.concat(repos));
};

module.exports = getAllReposInOrg;