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
  'polarity-user-creation',
  'polarityio.github.io',
  'worldtradingdata',
  'wikipedia',
  'demo-asset',
  'active-directory',
  'screenshotmachine',
  'template-integration',
  'aceintel',
  'tardis',
  'demo-assets',
  'polarity-integration-utils',
  'url-unshortener',
  'ion',
  'template-integration',
  'odin',
  'dnd5e',
  'secureworks-tims',
  'analyst-history',
  'analyst-telemetry',
  'poolparty',
  'diablo3',
  'style-guide',
  'polarity-tags',
  'pastebin-dmps',
  'cats',
  'sensitive-data-highlighter',
  'vz-dhcp-mapper',
  'greynoise-community',
  'ioc-submission-template',
  'generic-rest-sample',
  //Temporary from repos testing has already created a release on
  'arin'
];

// Repo names where the config.json will need to be created manually
const CONFIG_JSON_REPOSITORY_DEPLOY_BLOCK_LIST = [
  'sentinelone',
  'ironnet-collective-defense-portal',
  'threatquotient',
  'cyberchef',
  'maxmind',
  'misp-warning-lists'
];

module.exports = {
  REPOSITORY_DEPLOY_BLOCK_LIST,
  CONFIG_JSON_REPOSITORY_DEPLOY_BLOCK_LIST
};
