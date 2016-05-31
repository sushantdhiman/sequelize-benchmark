'use strict';

const debug = require('debug')
    , defaults = require('lodash.defaults')
    , Sequelize = require('sequelize');

module.exports = {
  log: debug('sequelize:perf'),
  createSequelizeInstance: function(config, dialect) {
    let options = {};
    options.dialect = dialect;

    let sequelizeOptions = defaults(options, {
      host: options.host || config.host,
      logging: (process.env.SEQ_LOG ? debug('sequelize:perf:db') : false),
      dialect: options.dialect,
      port: options.port || process.env.SEQ_PORT || config.port,
      pool: config.pool,
      dialectOptions: options.dialectOptions || {}
    });

    if (dialect === 'postgres-native') {
      sequelizeOptions.native = true;
    }

    if (config.storage) {
      sequelizeOptions.storage = config.storage;
    }

    return this.getSequelizeInstance(config.database, config.username, config.password, sequelizeOptions);
  },

  getSequelizeInstance: function(db, user, pass, options) {
    options = options || {};
    options.dialect = options.dialect || this.getTestDialect();
    return new Sequelize(db, user, pass, options);
  }
};
