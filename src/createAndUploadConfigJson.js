const {
  size,
  get,
  flow,
  replace,
  filter,
  includes,
  map,
  split,
  reduce,
  compact,
  toLower,
  first
} = require('lodash/fp');
const { CONFIG_JSON_REPOSITORY_DEPLOY_BLOCK_LIST } = require('./constants');
const {
  decodeBase64,
  encodeBase64,
  parseErrorToReadableJSON
} = require('./dataTransformations');

const createAndUploadConfigJson = async (octokit, orgId, allOrgRepos) => {
  const fileCreationFunctions = flow(
    filter((repo) => !includes(repo.name, CONFIG_JSON_REPOSITORY_DEPLOY_BLOCK_LIST)),
    map(getConfigContentAndCreateJsonVersion(octokit, orgId))
  )(allOrgRepos);

  if (size(fileCreationFunctions)) console.info('\nStarting Upload of All `config.json` Files');

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const fileCreationFunction of fileCreationFunctions) {
    await fileCreationFunction();
  }
};

const getConfigContentAndCreateJsonVersion =
  (octokit, orgId) =>
  ({ name: repoName }) =>
  async () => {
    try {
      let configJsContents = get(
        'data.content',
        await octokit.repos.getContent({
          owner: orgId,
          repo: repoName,
          branch: 'develop',
          path: 'config/config.js'
        })
      );
      if (!size(configJsContents)) return;

      const configJsonContent = createConfigJsonContent(configJsContents);

      await octokit.repos.createOrUpdateFileContents({
        owner: orgId,
        repo: repoName,
        path: 'config/config.json',
        message: 'Adding config.json',
        branch: 'develop',
        content: configJsonContent,
        committer: {
          name: orgId,
          email: 'info@polarity.io'
        },
        author: {
          name: orgId,
          email: 'info@polarity.io'
        }
      });
      console.info(
        `- Config.json Upload Success: ${repoName}  (https://github.com/polarityio/${repoName}/blob/develop/config/config.json)`
      );
    } catch (error) {
      console.info(`- Config.json Upload Failed: ${repoName}`);
      console.info({ repoName, err: parseErrorToReadableJSON(error) });
    }
  };

const createConfigJsonContent = (configJsContents) => {
  let configJsJsonContent;
  configJsJsonContent = flow(
    replace(/\n/g, ''),
    decodeBase64,
    replace('module.exports = ', 'configJsJsonContent = '),
    eval
  )(configJsContents);

  console.log
  const entityTypesWithCorrectCasing = compact(
    map(getCorrectEntityTypeCasing, configJsJsonContent.entityTypes)
  );

  const formattedCustomTypes = size(configJsJsonContent.customTypes) && {
    customTypes: map(transformRegexForJSON, configJsJsonContent.customTypes)
  };

  const configJsonJsContent = {
    ...configJsJsonContent,
    entityTypes: entityTypesWithCorrectCasing,
    ...formattedCustomTypes
  };

  const configJsonContent = encodeBase64(JSON.stringify(configJsonJsContent, null, 2));

  return configJsonContent;
};

const getCorrectEntityTypeCasing = (entityType) =>
  get(toLower(entityType), {
    hash: 'hash',
    md5: 'MD5',
    sha1: 'SHA1',
    sha256: 'SHA256',
    ipv4: 'IPv4',
    ipv4cidr: 'IPv4CIDR',
    ipv6: 'IPv6',
    cve: 'cve',
    string: 'string',
    url: 'url',
    domain: 'domain',
    email: 'email',
    '*': '*'
  });

const transformRegexForJSON = (customType) => {
  const regexString = customType.regex.toString();

  const modCharToFlag = {
    g: { isGlobal: true },
    i: { isCaseSensitive: false }
  };

  const regexModifiers = flow(
    first,
    split(''),
    reduce(
      (agg, modifierCharacter) => ({
        ...agg,
        ...modCharToFlag[modifierCharacter]
      }),
      {}
    )
  )(regexString.match(/([^\/]+$)/));

  const unwrappedRegexString = replace(/([^\/]+$)/, '', regexString).slice(1, -1);

  return {
    ...customType,
    regex: unwrappedRegexString,
    ...regexModifiers
  };
};

module.exports = createAndUploadConfigJson;
