'use strict';
const logger = require('winston');
const Promise = require('bluebird');
const util = require('util');

const TABLE_STOCK = 'stock';
const TABLE_AGENT = 'agent';
const AGENT_CONFIG_LASTUPDATE = 'chartLastUpdate';

class Database {
    /**
     * options : { renew: [true|false] , knexConfig: knexConfig }
     */
    constructor(options, callback) {
        this.knex = require('knex')(options.knexConfig);
        this.healthCheck(options.renew, callback);
    }

    /**
     * Database Healthcheck
     */
    healthCheck(renew, callback) {
        let knex = this.knex;
        let self = this;
        logger.info('initialize Database ....');
        if (renew) {
            logger.info('renew database flag enabled .... clean if exists');
            // drop table `agent` if exists
            knex.schema.dropTableIfExists(TABLE_AGENT).then(function () {
                logger.info(`drop table 'agent' successfully ... `);
            });
            // drop table `stock` if exists
            knex.schema.dropTableIfExists(TABLE_STOCK).then(function () {
                logger.info(`drop table 'stock' successfully ... `);
            });
        }
        Promise.all([
            this.createAgentTable(renew),
            this.createStockTable(renew)
        ]).then(function () {
            if (callback) {
                callback(self);
                self = null;
                callback = null;
            }
        });

    }

    initLastUpdateTime() {
        logger.info('time stamp start ... ');
        this.knex(TABLE_AGENT).insert({ name: AGENT_CONFIG_LASTUPDATE, value: null }).then(() => {
            logger.info('time stamp completed ... ');
        });
    }
    /**
     *  create Agent Config table
     */
    createAgentTable(renew) {
        var knex = this.knex;
        return knex.schema.hasTable(TABLE_AGENT).then(function (result) {
            if (!result) {
                return knex.schema.createTableIfNotExists(TABLE_AGENT, function (table) {
                    logger.info(`create '${TABLE_AGENT}' table ... start`);
                    table.string('name').primary();
                    table.string('value');
                }).then(function () {
                    logger.info(`create '${TABLE_AGENT}' table ... completed`);
                }).catch(function (err) {
                    logger.info("ERR:", err.message);
                });
            }
        });
    }

    /**
     *  create Stock table
     */
    createStockTable(renew) {
        let knex = this.knex;
        return knex.schema.hasTable(TABLE_STOCK).then(function (result) {
            if (!result) {
                return knex.schema.createTableIfNotExists(TABLE_STOCK, function (table) {
                    logger.info(`create '${TABLE_STOCK}' table ... start`);
                    table.increments('id').primary();
                    table.string('name');
                    table.dateTime('date');
                    table.string('value');
                }).then(() => {
                    logger.info(`create '${TABLE_STOCK}' table ... completed`);
                }).catch(function (err) {
                    logger.info("ERR:", err.message);
                });
            }
        });
    }

    getChartData(){
        let knex = this.knex;
        return knex(TABLE_STOCK).count('date as count').then(function(offset){
            return knex.column('date', 'value').select()
                    .from(TABLE_STOCK).where({name:'nasdaq'})
                    .orderBy('date', 'asc').limit(50).offset(offset[0].count  - 50);
        }) 

    }
    getLastUpdateTime() {
        let knex = this.knex;
        return knex(TABLE_AGENT).where({ name: AGENT_CONFIG_LASTUPDATE }).select('value');
    }

    storeChartData(obj) {
        let knex = this.knex;
        let self = this;
        return knex.transaction(function (trx) {
            logger.info(`store stock records > ${obj.data.length}`);
            let config = { name: AGENT_CONFIG_LASTUPDATE, value: '' + obj.lastUpdateTime };
            return Promise.all([
                knex(TABLE_AGENT).transacting(trx).update(config),
                knex.batchInsert(TABLE_STOCK, obj.data, 30).transacting(trx)
            ]).then(function () {
                logger.info('transaction committed');
                return trx.commit();
            }).catch(function () {
                logger.info('transaction rollback');
                return trx.rollback();
            });

        });
    }

}

module.exports = Database;