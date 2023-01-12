const { get } = require('lodash/fp');
const { parseErrorToReadableJSON, encodeBase64 } = require('./dataTransformations');

const getExistingFile = async (octokit, orgId, repoName, branch, relativePath) =>
  await octokit.repos
    .getContent({
      owner: orgId,
      repo: repoName,
      ref: branch,
      path: relativePath
    })
    .catch((error) => {
      if (!error.message.includes('Not Found')) {
        throw error;
      }
    });

const uploadFile = async (
  octokit,
  orgId,
  repoName,
  branch,
  relativePath,
  existingFileSha,
  fileContent
) =>
  await octokit.repos.createOrUpdateFileContents({
    owner: orgId,
    repo: repoName,
    branch,
    path: relativePath,
    ...(existingFileSha && { sha: existingFileSha }),
    message: `Updating File: ${relativePath}`,
    content: encodeBase64(fileContent),
    committer: {
      name: orgId,
      email: 'info@polarity.io'
    },
    author: {
      name: orgId,
      email: 'info@polarity.io'
    }
  });

const createOrUpdateFile = async ({
  octokit,
  orgId = 'polarityio',
  repoName,
  branch = 'develop',
  relativePath,
  newFileContent,
  updatePreviousFile = () => ''
}) => {
  try {
    const currentFileContent = await getExistingFile(
      octokit,
      orgId,
      repoName,
      branch,
      relativePath
    );

    const existingFileSha = get('data.sha', currentFileContent);

    const uploadedFile = await uploadFile(
      octokit,
      orgId,
      repoName,
      branch,
      relativePath,
      existingFileSha,
      existingFileSha && updatePreviousFile
        ? updatePreviousFile(currentFileContent)
        : newFileContent
    );

    console.info({ currentFileContent, uploadedFile });
    console.info(`- File Upload Successful: ${repoName} <- "${relativePath}"  ()`);
  } catch (error) {
    console.info(`- File Upload Failed: ${repoName} <- "${relativePath}"`);
    console.info({
      repoName,
      err: parseErrorToReadableJSON(error),
      errRequest: parseErrorToReadableJSON(error.request),
      errHeaders: parseErrorToReadableJSON(error.headers)
    });
  }
};

module.exports = {
  getExistingFile,
  uploadFile,
  createOrUpdateFile
};
