const REPOSITORY_DEPLOY_BLOCK_LIST = [
  // Non-Integration Repos
  //   * Reference Material
  'ioc-submission-template',
  'template-integration',
  'generic-rest-sample',
  'int-ui-code-reference',
  'demo-assets',
  'style-guide',
  //   * Websites
  'reference-channels',
  'polarityio.github.io',
  //   * CLIs
  'polarity-cli-integration-search',
  'polarity-annotation-manager',
  'polarity-csv-loader',
  'polarity-user-creation',
  //   * GitHub Actions
  'testing-github-actions',
  'test-int-for-actions',
  'polarity-github-actions',
  'polarity-integration-development-checklist',
  //   * Node Libraries
  'node-maxmind',
  'node-dig-dns',
  'polarity-node-rest-api',
  'cyberchef-node',
  'polarity-integration-utils',

  // No Longer Supported Integrations
  'trendmicro-xdr',
  'worldtradingdata',
  'polarity-tags',
  'greynoise-community',
  'vz-dhcp-mapper',
  'sensitive-data-highlighter',
  'pastebin-dmps',
  'poolparty',
  'secureworks-tims',
  'url-unshortener',
  'aceintel',
  'active-directory',
  'analyst-telemetry',
  'analyst-history',
  'arcsight',

  'dnd5e',
  'cats',
  'diablo3',
  'ion',
  'odin',
  'tardis',

  // Half Started Repos
  'microsoft-teams',
  'securonix',
  'Polarity-Platform',

  // Know issues with creating auto releases for these repos.  Check if the issues have been resolve and remove from this list if they have.
  'shodan-enterprise', // Issue with installing --no-bin-links with sqlite3 package
  'h-isac-taxii-feeds', // Issue with installing --no-bin-links with pouch-db package

  // In Progress.  Remove once a release has occurred
  'google-bard',
  'time-zone-convertor',
  'whoisxmlapi',
  'screenshotmachine',
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
