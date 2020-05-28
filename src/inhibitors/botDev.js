const { developerIds } = require('../config');

module.exports = function ({ author }) {
  if (developerIds.includes(author.id)) {
    return false;
  }
  return 'not-developer';
};
