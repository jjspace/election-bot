const { getRandElem } = require('../utils');
// client design inspired by: https://saltsthlm.github.io/protips/lowdb.html

// NOTE: this method does NOT return a value but instead the server obj
module.exports.getServer = (db, serverId) => db.get('servers').getById(serverId);

const SELF_NOM = {
  NO: 0,
  YES: 1,
  YES_BACKUP: 2,
};
module.exports.SELF_NOM = SELF_NOM;

module.exports.addServer = (db, serverId, serverName) => {
  // TODO: Extract these defaults to config?
  const newServer = {
    id: serverId,
    name: serverName,
    commandPrefix: 'e!',
    positions: [],
    nominations: [],
    settings: {
      managers: {
        roles: [],
        users: [],
      },
      selfNominate: SELF_NOM.YES,
      voterRole: null,
    },
  };
  db.get('servers')
    .insert(newServer)
    .write();
};

module.exports.getCommandPrefix = serverDb => serverDb.get('commandPrefix').value();
module.exports.setCommandPrefix = (serverDb, newValue) =>
  serverDb.set('commandPrefix', newValue).write();

module.exports.getVoterRole = serverDb => serverDb.get('settings.voterRole').value();
module.exports.setVoterRole = (serverDb, newValue) =>
  serverDb.set('settings.voterRole', newValue).write();

module.exports.getManagers = serverDb => serverDb.get('settings.managers').value();
module.exports.addManagerRole = (serverDb, roleId) =>
  serverDb
    .get('settings.managers.roles')
    .upsert(roleId)
    .write();
module.exports.removeManagerRole = (serverDb, roleId) =>
  serverDb
    .get('settings.managers.roles')
    .pull(roleId)
    .write();
module.exports.addManagerUser = (serverDb, userId) =>
  serverDb
    .get('settings.managers.users')
    .upsert(userId)
    .write();
module.exports.removeManagerUser = (serverDb, userId) =>
  serverDb
    .get('settings.managers.users')
    .pull(userId)
    .write();

module.exports.getAllowedRoles = serverDb => serverDb.get('allowedRoles').value();
module.exports.addAllowedRole = (serverDb, newRole) => {
  serverDb
    .get('allowedRoles')
    .upsert(newRole)
    .write();
};
module.exports.removeAllowedRole = (serverDb, roleId) => {
  serverDb
    .get('allowedRoles')
    .pull(roleId)
    .write();
};

module.exports.getPositions = serverDb => serverDb.get('positions').value();
module.exports.getPosition = (serverDb, id) =>
  serverDb
    .get('positions')
    .find({ id })
    .value();
module.exports.addPosition = (serverDb, id, name, desc = '') =>
  serverDb
    .get('positions')
    .upsert({ id, name, desc })
    .write();
module.exports.editPosition = (serverDb, id, newVals) =>
  serverDb
    .get('positions')
    .find({ id })
    .assign(newVals)
    .write();
module.exports.removePosition = (serverDb, id) =>
  serverDb
    .get('positions')
    .remove({ id })
    .write();

module.exports.getNominations = (serverDb, filter = {}) =>
  serverDb
    .get('nominations')
    .filter(filter)
    .value();
module.exports.getNomination = (serverDb, userId, positionId) =>
  serverDb
    .get('nominations')
    .find({ userId, positionId })
    .value();
module.exports.addNomination = (serverDb, userId, positionId, nominatorId) => {
  const nomination = serverDb.get('nominations').find({ userId, positionId });
  if (nomination.value()) {
    // nomination already exists, add to nominators
    nomination
      .get('nominators')
      .insert(nominatorId)
      .write();
  } else {
    serverDb
      .get('nominations')
      .insert({ userId, positionId, nominators: [nominatorId] })
      .write();
  }
};
module.exports.removeNomination = (serverDb, userId, positionId, nominatorId) => {
  const nomination = serverDb.get('nominations').find({ userId, positionId });
  if (nomination) {
    nomination
      .get('nominators')
      .pull(nominatorId)
      .write();
    // Remove if there's no more nominators
    if (!nomination.get('nominators').value().length) {
      serverDb
        .get('nominations')
        .remove({ userId, positionId })
        .write();
    }
  }
};

//
// Old client
//

module.exports.getQuoteSets = serverDb => serverDb.get('quoteSets').value();
module.exports.getQuoteSet = (serverDb, setName) =>
  serverDb
    .get('quoteSets')
    .get(setName)
    .value();
module.exports.addQuoteSet = (serverDb, setName) =>
  serverDb
    .get('quoteSets')
    .set(setName, [])
    .write();
// TODO: add backup of deleted sets as {setName, time, quotes} or something for recovery
module.exports.removeQuoteSet = (serverDb, setName) =>
  serverDb
    .get('quoteSets')
    .unset(setName)
    .write();

module.exports.addQuote = (serverDb, setName, quote) =>
  serverDb
    .get('quoteSets')
    .get(setName)
    .push(quote)
    .write();
module.exports.removeQuote = (serverDb, setName, quote) =>
  serverDb
    .get('quoteSets')
    .get(setName)
    .pull(quote)
    .write();
module.exports.removeQuoteByIndex = (serverDb, setName, index) =>
  serverDb
    .get('quoteSets')
    .get(setName)
    .splice(index, 1)
    .write();
module.exports.getRandomQuote = (serverDb, setName) => {
  let sourceSet = setName;
  let quotes = [];
  if (setName) {
    quotes = this.getQuoteSet(serverDb, setName);
  } else {
    const sets = this.getQuoteSets(serverDb);
    const randSet = getRandElem(Object.keys(sets));
    sourceSet = randSet;
    quotes = sets[randSet];
  }
  return [sourceSet, getRandElem(quotes)];
};
