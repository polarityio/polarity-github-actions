const {
  get,
  isEmpty,
  flow,
  first,
  split,
  set,
  parseInt,
  last,
  join,
  includes
} = require('lodash/fp');
const { decodeBase64 } = require('./dataTransformations');

const bumpPackageJsonVersion = async (octokit, orgId, [currentRepo, ...allOrgRepos]) => {
  if (isEmpty(currentRepo)) return;

  await createOrUpdateFile({
    octokit,
    orgId,
    repoName: currentRepo.name,
    relativePath: './package.json',
    updatePreviousFile
  });

  return await bumpPackageJsonVersion(octokit, orgId, allOrgRepos);
};

const updatePreviousFile = flow(
  get('data.content'),
  replace(/\n/g, ''),
  decodeBase64,
  JSON.parse,
  (previousFileContent) => ({
    ...previousFileContent,
    version: bumpSemanticVersion(previousFileContent.version)
  })
);

const bumpSemanticVersion = (originalVersion) =>
  flow(
    split('-'),
    first,
    split('.'),
    (versionArray) => set('2', parseInt(10, last(versionArray)) + 1, versionArray),
    join('.'),
    (nonBetaVersion) =>
      includes('-beta', originalVersion) ? nonBetaVersion + '-beta' : nonBetaVersion
  )(originalVersion);

module.exports = bumpPackageJsonVersion;
