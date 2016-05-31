'use strict';

/**
* Module to benchmark findAll function
*/
const Benchmark = require('benchmark')
, Utils = require('../utils')
, samplesize = require('lodash.samplesize');

const LARGE_SAMPLE_SIZE = 1500, SMALL_SAMPLE_SIZE = 10;

/**
 * Create sample test data
 *
 * @return {Array}
 */
const createTestData = () => {
  let usernames = []
  , profiles = [];

  for (let i = 1; i < 15000; i++) {
    usernames.push({ username: 'username-' + Math.round(Math.random() * 10000000000) });
    profiles.push({
      email: 'email-' + Math.round(Math.random() * 10000000000),
      amount: (Math.random() * 10000000000),
      userId: i
    });
  }

  return [usernames, profiles];
};

/**
 * Init models with sample data, prepare search sample
 */
const setup = (models, sequelize) => {
  let data = createTestData()
    , usernames = data[0]
    , profiles = data[1];

  return models.user
  .bulkCreate(usernames)
  .then(() => {
    return models.profile.bulkCreate(profiles);
  })
  .then(() => {
    // extract search sample
    let largeSample = samplesize(usernames, LARGE_SAMPLE_SIZE).map((u) => u.username)
      , smallSample = samplesize(usernames, SMALL_SAMPLE_SIZE).map((u) => u.username);

    // clear memory
    profiles = null;
    usernames = null;

    return sequelize.Promise.resolve([largeSample, smallSample]);
  });
};

module.exports = function(models, sequelize) {
  let testPromise = sequelize.Promise.defer()
  , findAllSuite = new Benchmark.Suite('findAll');

  let smallSample, largeSample;

  setup(models, sequelize)
    .spread(function(l, s){
      largeSample = l;
      smallSample = s;

      findAllSuite
      .add({
        defer: true,
        name: 'findAll#' + LARGE_SAMPLE_SIZE,
        fn: function(deferred) {
          models.user.findAll({
            where: {
              username: largeSample
            }
          }).then(() => {
            deferred.resolve();
          });
        }
      })
      .add({
        defer: true,
        name: 'findAll#' + LARGE_SAMPLE_SIZE + '#include',
        fn: function(deferred) {
          models.user.findAll({
            where: {
              username: largeSample
            },
            include: [{model: models.profile, required: true }]
          }).then(() => {
            deferred.resolve();
          });
        }
      })
      .add({
        defer: true,
        name: 'findAll#' + SMALL_SAMPLE_SIZE,
        fn: function(deferred) {
          models.user.findAll({
            where: {
              username: smallSample
            }
          }).then(() => {
            deferred.resolve();
          });
        }
      })
      .add({
        defer: true,
        name: 'findAll#' + SMALL_SAMPLE_SIZE + '#include',
        fn: function(deferred) {
          models.user.findAll({
            where: {
              username: smallSample
            },
            include: [{model: models.profile, required: true }]
          }).then(() => {
            deferred.resolve();
          });
        }
      })
      // add listeners
      .on('cycle', function(event) {
        Utils.log(String(event.target)
          + ` (mean ${event.target.times.period}s)`
        );
      })
      .on('complete', function() {
        testPromise.resolve();
      })
      .on('error', function(e) {
        Utils.log('Error : ' + e);
        testPromise.reject(e);
      })
      // run async
      .run({ 'async': true });

    });

  return testPromise.promise;
};
