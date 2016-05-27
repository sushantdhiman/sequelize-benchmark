'use strict';

process.env.DIALECT = process.env.DIALECT || 'mysql';

const Utils = require('./utils')
    , Config = require('./config');

let sequelize;

const init = function() {
  process.env.DIALECT && Utils.log(`Using ${process.env.DIALECT} DIALECT.`);
  return Utils.createSequelizeInstance(Config[process.env.DIALECT], process.env.DIALECT);
};


module.exports.run = function() {
  sequelize = init();
};
