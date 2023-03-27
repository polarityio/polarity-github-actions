const core = require('@actions/core');
const github = require('@actions/github');
const { map, size, get, flow, filter, join } = require('lodash/fp');

const getAllReposInOrg = require('./src/getAllReposInOrg');
const uploadActions = require('./src/uploadActions');
const createAndUploadConfigJson = require('./src/createAndUploadConfigJson');
const increasePackageJsonVersion = require('./src/increasePackageJsonVersion');
const { createPullRequest, mergePullRequest } = require('./src/pullRequests');
const addIntegrationIdToConfigs = require('./src/addIntegrationIdToConfigs');

const main = async () => {
  try {
    console.info('Starting Deploy Organization Actions...\n');
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);

    const orgId = core.getInput('org_id');
    const actionFileNames = core.getMultilineInput('action_file_names');
    const repoNamesForTesting = core.getMultilineInput('repository_names_for_testing');

    const allOrgRepos = size(repoNamesForTesting)
      ? map((name) => ({ name }), repoNamesForTesting)
      : await getAllReposInOrg(octokit, orgId);

    const remainingPackageJsonReposToUpdate = flow(
      filter(flow(get('name'), (repoName) => !successfulRepos.includes(repoName))),
      map(get('name')),
      join(', ')
    )(allOrgRepos);
    console.info(
      'Repos Where package.json version updates did not go through',
      remainingPackageJsonReposToUpdate
    );
    /** Add one-off functions to run here */
    // await addIntegrationIdToConfigs(octokit, orgId, allOrgRepos);

    /** Feature Flagged Features */
    // if (core.getBooleanInput('increment_package_json_version'))
    //   await increasePackageJsonVersion(octokit, orgId, allOrgRepos);

    // let createdPullRequests = [];
    // if (core.getBooleanInput('should_auto_create_pull_requests'))
    //   createdPullRequests = await createPullRequest(octokit, orgId, allOrgRepos);

    // if (core.getBooleanInput('should_auto_merge_pull_requests'))
    //   await mergePullRequest(octokit, orgId, createdPullRequests);
  } catch (error) {
    core.setFailed(error);
  }
};

const successfulRepos = [
  'crits',
  'splunk',
  'google-maps',
  'domain-tools',
  'google-safe-browsing',
  'ups-tracking',
  'sql-server-example',
  'redis-example',
  'carbon-black',
  'threatconnect',
  'scoutprime',
  'ipinfo',
  'staxx',
  'elasticsearch',
  'reversinglabs',
  'servicedesk-plus',
  'threatstream',
  'misp',
  'farsight-dnsdb',
  'threatquotient',
  'shodan',
  'fullcontact',
  'qradar',
  'alienvault-otx',
  'x-force-exchange',
  'phantom',
  'metadefender',
  'postgresql',
  'paloalto-autofocus',
  'epoch-time',
  'salesforce',
  'pulsedive',
  'confluence',
  'reversinglabs-A1000',
  'discoverorg',
  'swimlane',
  'servicenow',
  'zendesk',
  'vulndb',
  'recorded-future',
  'domaintools-iris',
  'jira',
  'resilient',
  'greynoise',
  'idefense',
  'cybersponse',
  'area-codes',
  'riskiq',
  'sharepoint',
  'thehive',
  'google-drive',
  'decoder',
  'cyber-risk-analytics',
  'ldap',
  'snort-sig',
  'urlhaus',
  'hybrid-analysis',
  'passivetotal',
  'rapid7-nexpose',
  'windows-security-events',
  'trustar',
  'haveibeenpwnd',
  'cisco-umbrella',
  'emailrep',
  'abuseipdb',
  'flashpoint',
  'intel-471',
  'redmine',
  'google-translate',
  'tenable-sc',
  'redmine-issue-creator',
  'majestic-million',
  'cybereason',
  'font-changer',
  'crowdstrike',
  'merriam-webster',
  'vuldb',
  'trapx',
  'local-calling-guide',
  'ripestat',
  'cisco-threat-response',
  'dig',
  'cortex-xsoar',
  'fir-search',
  'malware-bazaar',
  'illuminate',
  'gigamon',
  'slashnext',
  'url-pivots',
  'chronicle-backstory',
  'misp-warning-lists',
  'unshorten.me',
  'google-custom-search',
  'hackerone',
  'mandiant-threat-intelligence',
  'hyas-insight',
  'cofense-intelligence',
  'crxcavator',
  'proofpoint-url-decoder',
  'fireeye-dod',
  'efficient-ip',
  'threatstream-ioc-submission',
  'pipl',
  'csv-to-integration',
  'censys',
  'azure-adfs-errors',
  'misp-ioc-submission',
  'securonix-siem',
  'analyst1',
  'servicenow-sir',
  'digital-shadows',
  'rsa-archer',
  'hashdd',
  'andariel-botnet-rdp-search',
  'andariel-tir',
  'mongodb',
  'rapid7-attackerkb',
  'osint-pivots',
  'carbon-black-edr',
  'threatconnect-ioc-submission',
  'threatquotient-ioc-submission',
  'spur',
  'social-media-searcher',
  'cyberchef',
  'cortex-xsoar-ioc-submission',
  'orca',
  'andariel-ioc-search',
  'mysql',
  'devo',
  'youtube',
  'fortress',
  'binaryedge',
  'yara-finder',
  'stackoverflow',
  'regex-cheatsheet',
  'crowdstrike-intel',
  'google-compute-engine',
  'sophos',
  'hostio',
  'darkowl',
  'axonius',
  'google-search',
  'h-isac-taxii-feeds',
  'twitter',
  'sandboxes',
  'shodan-enterprise',
  'phishstats',
  'linkedin',
  'github',
  'opencti',
  'intsights',
  'sumo-logic',
  'analyst-telemetry-splunk',
  'analyst-telemetry-elasticsearch',
  'security-blogs',
  'threatminer',
  'apivoid',
  'rapid7-insightidr',
  'ripe',
  'crowdstrike-ioc',
  'trendmicro-xdr',
  'threatconnect-intel-search',
  'sentinelone',
  'spycloud',
  'twinwave',
  'fireeye-hx',
  'qualys',
  'redis',
  'sharepoint-enterprise',
  'aws-dynamodb',
  'cisa-vuln',
  'slack',
  'dragos',
  'microsoft-sentinel',
  'aws-ec2',
  'microsoft-teams',
  'criminal-ip',
  'ironnet-collective-defense-portal',
  'shodan-internetdb',
  'okta'
];
/** Useful Snippets
 * These are snippets that have been used in the past but aren't used often enough
 * to justify creating an Action File Input Flag (i.e. `core.getBooleanInput('increment_package_json_version')`)
 * to toggle from the Action File.
 *
 * Initial Creation of the `config/config.json` files:
 * await createAndUploadConfigJson(octokit, orgId, allOrgRepos);
 *
 * When making changes to the values of the GitHub Action Files
 * that Exist on Each Repository:
 * await uploadActions(octokit, orgId, allOrgRepos, actionFileNames);
 *
 */

main();

module.exports = main;
