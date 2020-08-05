const core = require("@actions/core");
const github = require("@actions/github");

const main = async () => {
  try {
    console.log('Starting Deploy Project Actions...\n');
    const projectId = core.getInput("project_id");
    const actionFileNames = core.getInput("action_file_names");
    console.log(JSON.stringify({ projectId, actionFileNames }, null, 2));
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();

module.exports = main;