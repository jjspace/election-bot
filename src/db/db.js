const path = require('path');
const lowdb = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const Memory = require('lowdb/adapters/Memory');
const logger = require('../logger');
const { dbName } = require('../config');

const dbPath = path.join(__dirname, dbName);

// DB design inspired by: https://saltsthlm.github.io/protips/lowdb.html

function openDB() {
  logger.info(`opening db ${process.env.NODE_ENV === 'test' ? 'in memory' : `at ${dbPath}`}`);
  const db = lowdb(process.env.NODE_ENV === 'test' ? new Memory() : new FileSync(dbPath));

  db._.mixin(lodashId);

  db.defaults({ servers: [] }).write();

  return db;
}

module.exports = openDB();
