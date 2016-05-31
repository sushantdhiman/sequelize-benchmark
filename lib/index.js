'use strict';

process.env.DIALECT = process.env.DIALECT || 'mysql';

const Utils = require('./utils')
, Config = require('./config')
, Sequelize = require('sequelize');

/**
* Create a base Sequelize Instance for current ENV settings
*
* @return Sequelize Instance
*/
const init = function() {
  process.env.DIALECT && Utils.log(`Using ${process.env.DIALECT} DIALECT.`);
  return Utils.createSequelizeInstance(Config[process.env.DIALECT], process.env.DIALECT);
};

/**
* Prepare the benchmark env
*
* @param Instance, Sequelize instance
*
* @return Promise, Models
*/
const setup = function(sequelize) {
  let models = {};
  models.user = sequelize.define('user', {
    username: Sequelize.STRING
  });
  models.profile = sequelize.define('profile', {
    email: Sequelize.STRING,
    amount: Sequelize.DECIMAL
  }, {
    indexes: [
      {
        fields: ['userId'],
        unique: true
      }
    ]
  });
  models.profile.belongsTo(models.user);
  models.user.hasOne(models.profile);
  return sequelize.getQueryInterface().dropAllTables()
  .then(() => (
    sequelize.sync({force: true})
  ))
  .then(() => models);
};

let sequelize = init(), models = null;

/**
* Run benchmark suite
*/
module.exports.run = function() {
  setup(sequelize).then((ms) => {
    Utils.log('Env ready');
    models = ms;
    return require('./benchmarks/findAll.js')(models, sequelize);
  }).catch(Utils.log);
};
