const parseErrorToReadableJSON = (error) =>
  JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));

const encodeBase64 = (str) => str && Buffer.from(str).toString('base64');

const decodeBase64 = (str) => str && Buffer.from(str, 'base64').toString('ascii');

module.exports = {
  parseErrorToReadableJSON,
  encodeBase64,
  decodeBase64
};
