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
  omit,
  replace,
  map,
  size,
  compact
} = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('./dataTransformations');
const {
  createOrUpdateFile,
  getExistingFile,
  parseFileContent
} = require('./octokitHelpers');

const removeBetaFromPackageFiles = async (octokit, orgId, allOrgRepos) => {
  const removeBetaIfExistsFunctions = map(
    getRemoveBetaIfExistsFunction(octokit, orgId),
    allOrgRepos
  );

  if (size(removeBetaIfExistsFunctions))
    console.info(
      'Removing `-beta` from `package.json` & `package-lock.json` version:'
    );

  const reposWhereBetaWasRemoved = [];
  // Must run file creation in series due to the common use of the octokit instantiation
  for (const removeBetaIfExistsFunction of removeBetaIfExistsFunctions) {
    reposWhereBetaWasRemoved.push(await removeBetaIfExistsFunction());
  }
  return compact(reposWhereBetaWasRemoved);
};

const getRemoveBetaIfExistsFunction =
  (octokit, orgId) =>
  ({ name: repoName, ...repo }) =>
  async () => {
    try {
      const version = getVersion(
        await getExistingFile({
          orgId,
          octokit,
          repoName,
          relativePath: 'package.json'
        })
      );

      if (!includes('-beta', version))
        return console.info(`- No \`beta\` found in package.json version: ${repoName}\n`);

      const newVersion = replace('-beta', '', version);

      await createOrUpdateFile({
        octokit,
        orgId,
        repoName,
        relativePath: 'package.json',
        updatePreviousFile: updateJsonVersion(newVersion)
      });

      await createOrUpdateFile({
        octokit,
        orgId,
        repoName,
        relativePath: 'package-lock.json',
        updatePreviousFile: updateJsonVersion(newVersion)
      });

      console.info(`- Successfully removed \`-beta\` from package.json (${repoName})\n`);
      
      return {
        name: repoName,
        ...repo
      };
    } catch (error) {
      console.info(`- Removing \`-beta\` from package.json Failed: ${repoName}`);
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

const parseJsonFileContent = flow(parseFileContent, JSON.parse);

const getVersion = flow(parseJsonFileContent, get('version'));

const updateJsonVersion = (version) => (fileValue) =>
  flow(
    parseJsonFileContent,
    (fileContentJson) => ({
      name: fileContentJson.name,
      version,
      ...omit('version', fileContentJson)
    }),
    (json) => JSON.stringify(json, null, 2)
  )(fileValue);

module.exports = removeBetaFromPackageFiles;
