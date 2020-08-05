const core = require('@actions/core');
const github = require('@actions/github');
const fp = require('lodash/fp');

const main = async () => {
  try {
    console.log('Starting Deploy Project Actions...\n');
    const projectId = core.getInput('project_id');
    const actionFileNames = fp.flow(
      fp.split('\n'),
      fp.map(fp.trim)
    )(core.getInput('action_file_names'));

    console.log(JSON.stringify({ projectId, actionFileNames }, null, 2));

    const token = core.getInput('GITHUB_TOKEN');

    const octokit = github.getOctokit(token);

    // console.log('octokit', octokit);

    const repos = await octokit.teams.listReposInOrg({
      org: projectId,
      team_slug: 'staff'
    });

    console.log('repos', repos);
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();

module.exports = main;
