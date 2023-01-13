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
  includes,
  assign,
  curry
} = require('lodash/fp');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('./octokitHelpers');

const bumpPackageJsonVersion = async (octokit, orgId, [currentRepo, ...allOrgRepos]) => {
  if (isEmpty(currentRepo)) return;

  const packageJsonFileContent = parseJsonFileContent(
    await getExistingFile({
      octokit,
      repoName: currentRepo.name,
      relativePath: 'package.json'
    })
  );

  const newVersion = flow(get('version'), bumpSemanticVersion)(packageJsonFileContent);

  await createOrUpdateFile({
    octokit,
    orgId,
    repoName: currentRepo.name,
    relativePath: 'package.json',
    updatePreviousFile: updateJsonVersion(newVersion)
  });

  await createOrUpdateFile({
    octokit,
    orgId,
    repoName: currentRepo.name,
    relativePath: 'package-lock.json',
    updatePreviousFile: updateJsonVersion(newVersion)
  });

  return await bumpPackageJsonVersion(octokit, orgId, allOrgRepos);
};

const parseJsonFileContent = flow(parseFileContent, JSON.parse);

const updateJsonVersion = curry((version, fileContent) =>
  flow(assign({ version }), (json) => JSON.stringify(json, null, 2))(
    fileContent
  )
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
