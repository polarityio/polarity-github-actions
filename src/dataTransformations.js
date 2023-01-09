const parseErrorToReadableJSON = (error) =>
  JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));

const encodeBase64 = (str) => str && Buffer.from(str).toString('base64');

const decodeBase64 = (str) => str && Buffer.from(str, 'base64').toString('ascii');

const sleep = async (ms = 2000) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  parseErrorToReadableJSON,
  encodeBase64,
  decodeBase64,
  sleep
};
