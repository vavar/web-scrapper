'use strict';

const Database = require('./data');
const Agent = require('./agent').ChartScraperAgent;
const app = require('./app');

//-------------------------------
// Logging config
//-------------------------------
const winston = require('winston');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {'timestamp':true});

//-------------------------------
// Knex config
//-------------------------------
const knexOptions = {
  client: 'sqlite3',
  // debug: true,
  connection: {
    filename: "./db.sqlite"
  },
  useNullAsDefault: true
};


Database({renew: false, knexConfig: knexOptions}, function (db) {
  let agent = new Agent(db);
  agent.start();
})