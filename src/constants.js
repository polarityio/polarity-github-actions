// Non-Integration Repo Names
const REPOSITORY_DEPLOY_BLOCK_LIST = [
  'testing-github-actions',
  'test-int-for-actions',
  'reference-channels',
  'node-maxmind',
  'polarityio.github.io',
  'polarity-github-actions',
  'polarity-integration-development-checklist',
  'securonix',
  'tenable-io',
  'microsoft-defender',
  'polarity-cli-integration-search',
  'polarity-node-rest-api',
  'node-dig-dns',
  'Polarity-Platform',
  'polarity-annotation-manager',
  'arcsight',
  'int-ui-code-reference',
  'polarity-csv-loader',
  'odin-delete-me',
  'polarity-user-creation',
  'polarityio.github.io'
];

// Repo names where the config.json will need to be created manually
const CONFIG_JSON_REPOSITORY_DEPLOY_BLOCK_LIST = [
  'sentinelone',
  'ironnet-collective-defense-portal',
  'threatquotient',
  'template-integration',
  'cyberchef',
  'maxmind',
  'ion',
  'misp-warning-lists'
];

module.exports = {
  REPOSITORY_DEPLOY_BLOCK_LIST,
  CONFIG_JSON_REPOSITORY_DEPLOY_BLOCK_LIST
};
