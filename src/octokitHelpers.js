const { get, replace, flow } = require('lodash/fp');
const {
  parseErrorToReadableJSON,
  encodeBase64,
  decodeBase64
} = require('./dataTransformations');

// API Reference https://octokit.github.io/rest.js/v19

const getExistingFile = async ({
  octokit,
  orgId = 'polarityio',
  repoName,
  branch = 'develop',
  relativePath
}) =>
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
  orgId = 'polarityio',
  repoName,
  branch = 'develop',
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
  updatePreviousFile
}) => {
  try {
    const currentFileContent = await getExistingFile({
      octokit,
      orgId,
      repoName,
      branch,
      relativePath
    });

    const existingFileSha = get('data.sha', currentFileContent);

    const newFileContentResult =
      existingFileSha && updatePreviousFile
        ? updatePreviousFile(currentFileContent)
        : newFileContent;

    if (
      ((existingFileSha && updatePreviousFile) || newFileContent) &&
      newFileContentResult
    ) {
      await uploadFile(
        octokit,
        orgId,
        repoName,
        branch,
        relativePath,
        existingFileSha,
        newFileContentResult
      );
    }

    const htmlUrl = get('data.html_url', currentFileContent);
    console.info(
      `- File Upload Successful: ${repoName} <- "${relativePath}"  (${htmlUrl})`
    );
  } catch (error) {
    console.info(`- File Upload Failed: ${repoName} <- "${relativePath}"`);
    console.info({
      repoName,
      err: parseErrorToReadableJSON(error),
      errRequest: parseErrorToReadableJSON(error.request || {}),
      errHeaders: parseErrorToReadableJSON(error.headers || {})
    });
  }
};

const parseFileContent = flow(get('data.content'), replace(/\n/g, ''), decodeBase64);

module.exports = {
  getExistingFile,
  uploadFile,
  createOrUpdateFile,
  parseFileContent
};
