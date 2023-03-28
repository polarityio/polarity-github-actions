const { size, map, get, isEmpty, compact, flow, first } = require('lodash/fp');
const { parseErrorToReadableJSON, sleep } = require('../dataTransformations');

const tempPullRequestsForAutoMerge = [
  { repoName: 'reversinglabs-A1000', pullRequest: { number: 17 } },
  { repoName: 'salesforce', pullRequest: { number: 19 } },
  { repoName: 'epoch-time', pullRequest: { number: 4 } },
  { repoName: 'phantom', pullRequest: { number: 19 } },
  { repoName: 'staxx', pullRequest: { number: 13 } },
  { repoName: 'ups-tracking', pullRequest: { number: 12 } },
  { repoName: 'crowdstrike-ioc', pullRequest: { number: 13 } },
  { repoName: 'crits', pullRequest: { number: 9 } },
  { repoName: 'splunk', pullRequest: { number: 19 } },
  { repoName: 'google-maps', pullRequest: { number: 11 } },
  { repoName: 'google-safe-browsing', pullRequest: { number: 5 } },
  { repoName: 'sql-server-example', pullRequest: { number: 7 } },
  { repoName: 'redis-example', pullRequest: { number: 13 } },
  { repoName: 'carbon-black', pullRequest: { number: 7 } },
  { repoName: 'threatconnect', pullRequest: { number: 16 } },
  { repoName: 'ipinfo', pullRequest: { number: 13 } },
  { repoName: 'elasticsearch', pullRequest: { number: 9 } },
  { repoName: 'reversinglabs', pullRequest: { number: 12 } },
  { repoName: 'servicedesk-plus', pullRequest: { number: 4 } },
  { repoName: 'threatstream', pullRequest: { number: 8 } },
  { repoName: 'misp', pullRequest: { number: 9 } },
  { repoName: 'farsight-dnsdb', pullRequest: { number: 19 } },
  { repoName: 'threatquotient', pullRequest: { number: 9 } },
  { repoName: 'shodan', pullRequest: { number: 18 } },
  { repoName: 'fullcontact', pullRequest: { number: 8 } },
  { repoName: 'qradar', pullRequest: { number: 8 } },
  { repoName: 'alienvault-otx', pullRequest: { number: 17 } },
  { repoName: 'x-force-exchange', pullRequest: { number: 8 } },
  { repoName: 'metadefender', pullRequest: { number: 7 } },
  { repoName: 'postgresql', pullRequest: { number: 4 } },
  { repoName: 'paloalto-autofocus', pullRequest: { number: 6 } },
  { repoName: 'pulsedive', pullRequest: { number: 7 } },
  { repoName: 'discoverorg', pullRequest: { number: 6 } },
  { repoName: 'swimlane', pullRequest: { number: 6 } },
  { repoName: 'servicenow', pullRequest: { number: 18 } },
  { repoName: 'zendesk', pullRequest: { number: 3 } },
  { repoName: 'vulndb', pullRequest: { number: 3 } },
  { repoName: 'recorded-future', pullRequest: { number: 8 } },
  { repoName: 'domaintools-iris', pullRequest: { number: 7 } },
  { repoName: 'jira', pullRequest: { number: 12 } },
  { repoName: 'resilient', pullRequest: { number: 9 } },
  { repoName: 'greynoise', pullRequest: { number: 13 } },
  { repoName: 'idefense', pullRequest: { number: 3 } },
  { repoName: 'cybersponse', pullRequest: { number: 2 } },
  { repoName: 'area-codes', pullRequest: { number: 2 } },
  { repoName: 'riskiq', pullRequest: { number: 5 } },
  { repoName: 'sharepoint', pullRequest: { number: 5 } },
  { repoName: 'thehive', pullRequest: { number: 8 } },
  { repoName: 'google-drive', pullRequest: { number: 8 } },
  { repoName: 'decoder', pullRequest: { number: 8 } },
  { repoName: 'cyber-risk-analytics', pullRequest: { number: 5 } },
  { repoName: 'ldap', pullRequest: { number: 7 } },
  { repoName: 'snort-sig', pullRequest: { number: 2 } },
  { repoName: 'urlhaus', pullRequest: { number: 7 } },
  { repoName: 'hybrid-analysis', pullRequest: { number: 2 } },
  { repoName: 'rapid7-nexpose', pullRequest: { number: 3 } },
  { repoName: 'windows-security-events', pullRequest: { number: 4 } },
  { repoName: 'trustar', pullRequest: { number: 4 } },
  { repoName: 'haveibeenpwnd', pullRequest: { number: 6 } },
  { repoName: 'cisco-umbrella', pullRequest: { number: 8 } },
  { repoName: 'emailrep', pullRequest: { number: 7 } },
  { repoName: 'abuseipdb', pullRequest: { number: 6 } },
  { repoName: 'flashpoint', pullRequest: { number: 10 } },
  { repoName: 'intel-471', pullRequest: { number: 9 } },
  { repoName: 'redmine', pullRequest: { number: 2 } },
  { repoName: 'google-translate', pullRequest: { number: 7 } },
  { repoName: 'redmine-issue-creator', pullRequest: { number: 2 } },
  { repoName: 'majestic-million', pullRequest: { number: 2 } },
  { repoName: 'cybereason', pullRequest: { number: 12 } },
  { repoName: 'font-changer', pullRequest: { number: 3 } },
  { repoName: 'crowdstrike', pullRequest: { number: 9 } },
  { repoName: 'merriam-webster', pullRequest: { number: 15 } },
  { repoName: 'vuldb', pullRequest: { number: 3 } },
  { repoName: 'trapx', pullRequest: { number: 8 } },
  { repoName: 'local-calling-guide', pullRequest: { number: 3 } },
  { repoName: 'ripestat', pullRequest: { number: 2 } },
  { repoName: 'cisco-threat-response', pullRequest: { number: 5 } },
  { repoName: 'dig', pullRequest: { number: 5 } },
  { repoName: 'cortex-xsoar', pullRequest: { number: 8 } },
  { repoName: 'fir-search', pullRequest: { number: 3 } },
  { repoName: 'malware-bazaar', pullRequest: { number: 3 } },
  { repoName: 'illuminate', pullRequest: { number: 3 } },
  { repoName: 'gigamon', pullRequest: { number: 6 } },
  { repoName: 'slashnext', pullRequest: { number: 2 } },
  { repoName: 'url-pivots', pullRequest: { number: 2 } },
  { repoName: 'chronicle-backstory', pullRequest: { number: 7 } },
  { repoName: 'misp-warning-lists', pullRequest: { number: 4 } },
  { repoName: 'unshorten.me', pullRequest: { number: 4 } },
  { repoName: 'google-custom-search', pullRequest: { number: 4 } },
  { repoName: 'hackerone', pullRequest: { number: 9 } },
  { repoName: 'mandiant-threat-intelligence', pullRequest: { number: 3 } },
  { repoName: 'hyas-insight', pullRequest: { number: 8 } },
  { repoName: 'cofense-intelligence', pullRequest: { number: 2 } },
  { repoName: 'crxcavator', pullRequest: { number: 2 } },
  { repoName: 'proofpoint-url-decoder', pullRequest: { number: 3 } },
  { repoName: 'fireeye-dod', pullRequest: { number: 2 } },
  { repoName: 'efficient-ip', pullRequest: { number: 3 } },
  { repoName: 'threatstream-ioc-submission', pullRequest: { number: 13 } },
  { repoName: 'pipl', pullRequest: { number: 4 } },
  { repoName: 'csv-to-integration', pullRequest: { number: 4 } },
  { repoName: 'censys', pullRequest: { number: 4 } },
  { repoName: 'azure-adfs-errors', pullRequest: { number: 4 } },
  { repoName: 'misp-ioc-submission', pullRequest: { number: 13 } },
  { repoName: 'securonix-siem', pullRequest: { number: 7 } },
  { repoName: 'analyst1', pullRequest: { number: 4 } },
  { repoName: 'servicenow-sir', pullRequest: { number: 7 } },
  { repoName: 'digital-shadows', pullRequest: { number: 7 } },
  { repoName: 'rsa-archer', pullRequest: { number: 5 } },
  { repoName: 'hashdd', pullRequest: { number: 4 } },
  { repoName: 'andariel-botnet-rdp-search', pullRequest: { number: 4 } },
  { repoName: 'andariel-tir', pullRequest: { number: 3 } },
  { repoName: 'rapid7-attackerkb', pullRequest: { number: 4 } },
  { repoName: 'osint-pivots', pullRequest: { number: 7 } },
  { repoName: 'carbon-black-edr', pullRequest: { number: 4 } },
  { repoName: 'threatconnect-ioc-submission', pullRequest: { number: 11 } },
  { repoName: 'threatquotient-ioc-submission', pullRequest: { number: 8 } },
  { repoName: 'spur', pullRequest: { number: 3 } },
  { repoName: 'social-media-searcher', pullRequest: { number: 6 } },
  { repoName: 'cortex-xsoar-ioc-submission', pullRequest: { number: 4 } },
  { repoName: 'orca', pullRequest: { number: 4 } },
  { repoName: 'andariel-ioc-search', pullRequest: { number: 4 } },
  { repoName: 'mysql', pullRequest: { number: 2 } },
  { repoName: 'devo', pullRequest: { number: 3 } },
  { repoName: 'youtube', pullRequest: { number: 3 } },
  { repoName: 'fortress', pullRequest: { number: 3 } },
  { repoName: 'binaryedge', pullRequest: { number: 3 } },
  { repoName: 'yara-finder', pullRequest: { number: 4 } },
  { repoName: 'stackoverflow', pullRequest: { number: 3 } },
  { repoName: 'regex-cheatsheet', pullRequest: { number: 3 } },
  { repoName: 'crowdstrike-intel', pullRequest: { number: 3 } },
  { repoName: 'google-compute-engine', pullRequest: { number: 2 } },
  { repoName: 'sophos', pullRequest: { number: 5 } },
  { repoName: 'hostio', pullRequest: { number: 2 } },
  { repoName: 'darkowl', pullRequest: { number: 4 } },
  { repoName: 'axonius', pullRequest: { number: 2 } },
  { repoName: 'google-search', pullRequest: { number: 3 } },
  { repoName: 'h-isac-taxii-feeds', pullRequest: { number: 6 } },
  { repoName: 'twitter', pullRequest: { number: 4 } },
  { repoName: 'sandboxes', pullRequest: { number: 4 } },
  { repoName: 'shodan-enterprise', pullRequest: { number: 4 } },
  { repoName: 'phishstats', pullRequest: { number: 4 } },
  { repoName: 'linkedin', pullRequest: { number: 3 } },
  { repoName: 'github', pullRequest: { number: 3 } },
  { repoName: 'opencti', pullRequest: { number: 4 } },
  { repoName: 'intsights', pullRequest: { number: 5 } },
  { repoName: 'sumo-logic', pullRequest: { number: 4 } },
  { repoName: 'analyst-telemetry-splunk', pullRequest: { number: 3 } },
  { repoName: 'analyst-telemetry-elasticsearch', pullRequest: { number: 3 } },
  { repoName: 'security-blogs', pullRequest: { number: 4 } },
  { repoName: 'threatminer', pullRequest: { number: 2 } },
  { repoName: 'apivoid', pullRequest: { number: 2 } },
  { repoName: 'rapid7-insightidr', pullRequest: { number: 5 } },
  { repoName: 'ripe', pullRequest: { number: 4 } },
  { repoName: 'threatconnect-intel-search', pullRequest: { number: 4 } },
  { repoName: 'sentinelone', pullRequest: { number: 11 } },
  { repoName: 'spycloud', pullRequest: { number: 3 } },
  { repoName: 'fireeye-hx', pullRequest: { number: 4 } },
  { repoName: 'qualys', pullRequest: { number: 7 } },
  { repoName: 'redis', pullRequest: { number: 2 } },
  { repoName: 'sharepoint-enterprise', pullRequest: { number: 2 } },
  { repoName: 'aws-dynamodb', pullRequest: { number: 3 } },
  { repoName: 'cisa-vuln', pullRequest: { number: 3 } },
  { repoName: 'dragos', pullRequest: { number: 5 } },
  { repoName: 'aws-ec2', pullRequest: { number: 5 } },
  { repoName: 'criminal-ip', pullRequest: { number: 1 } },
  { repoName: 'ironnet-collective-defense-portal', pullRequest: { number: 2 } },
  { repoName: 'shodan-internetdb', pullRequest: { number: 5 } },
  { repoName: 'okta', pullRequest: { number: 5 } }
];
const mergePullRequest = async (octokit, orgId, createdPullRequests) => {
  const mergePullRequestFunctions = map(
    mergePullRequestFunction(octokit, orgId),
    tempPullRequestsForAutoMerge
  );

  console.info(
    size(mergePullRequestFunctions)
      ? '\n\nMerging Pull Requests:'
      : '\n\n*** No Pull Requests Found to Merge ***:\n' +
          '- You may have forgotten to set `should_auto_create_pull_requests: true`'
  );

  // Must run file creation in series due to the common use of the octokit instantiation
  for (const mergePullRequestFunction of mergePullRequestFunctions) {
    await mergePullRequestFunction();
    await sleep(75000);
  }
};

const mergePullRequestFunction =
  (octokit, orgId) =>
  ({ repoName, pullRequest }) =>
  async () => {
    try {
      await octokit.pulls.merge({
        owner: orgId,
        repo: repoName,
        pull_number: pullRequest.number,
        commit_title:
          'Creating Release with Dereferenced Symlinks & No Dev Dependencies for Machine Readability'
      });

      console.info(
        `- Pull Request Merge Success: ${repoName} (https://github.com/polarityio/${repoName}/releases)`
      );
    } catch (error) {
      console.info(`- Pull Request Merge Failed: ${repoName}`);
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

module.exports = mergePullRequest;
