'use strict';

/**
* Module to benchmark findAll function
*/
const Benchmark = require('benchmark')
, Utils = require('../utils')
, samplesize = require('lodash.samplesize');

const LARGE_SAMPLE_SIZE = process.env.LARGE_SAMPLE_SIZE || 1500
    , SMALL_SAMPLE_SIZE = process.env.SMALL_SAMPLE_SIZE || 10;

/**
 * Create sample test data
 *
 * @return {Array}
 */
const createTestData = () => {
  let usernames = []
  , profiles = []
  , heavyProfile = [];

  for (let i = 1; i < 15000; i++) {
    usernames.push({ username: 'username-' + Math.round(Math.random() * 10000000000) });
    profiles.push({
      email: 'email-' + Math.round(Math.random() * 10000000000),
      amount: (Math.random() * 10000000000),
      userId: i
    });
    heavyProfile.push({
      data: new Buffer(1024),
      userId: i
    });
  }

  return [usernames, profiles, heavyProfile];
};

/**
 * Init models with sample data, prepare search sample
 */
const setup = (models, sequelize) => {
  let data = createTestData()
    , usernames = data[0]
    , profiles = data[1]
    , heavyProfile = data[2];

  return models.user
  .bulkCreate(usernames)
  .then(() => models.profile.bulkCreate(profiles))
  .then(() => models.heavyProfile.bulkCreate(heavyProfile))
  .then(() => {
    // extract search sample
    let largeSample = samplesize(usernames, LARGE_SAMPLE_SIZE).map((u) => u.username)
      , smallSample = samplesize(usernames, SMALL_SAMPLE_SIZE).map((u) => u.username);

    // clear memory
    profiles = null;
    usernames = null;
    heavyProfile = null;

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
        name: 'finding ' + LARGE_SAMPLE_SIZE + ' rows',
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
        name: 'finding(raw) ' + LARGE_SAMPLE_SIZE + ' rows',
        fn: function(deferred) {
          models.user.findAll({
            raw: true,
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
        name: 'finding(plain) ' + LARGE_SAMPLE_SIZE + ' rows',
        fn: function(deferred) {
          models.user.findAll({
            plain: true,
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
        name: 'finding ' + LARGE_SAMPLE_SIZE + ' rows with join',
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
        name: 'finding ' + LARGE_SAMPLE_SIZE + ' rows with join (heavy includes)',
        fn: function(deferred) {
          models.user.findAll({
            where: {
              username: largeSample
            },
            include: [
              {model: models.profile, required: true },
              {model: models.heavyProfile, required: true }
            ]
          }).then(() => {
            deferred.resolve();
          });
        }
      })
      .add({
        defer: true,
        name: 'finding ' + SMALL_SAMPLE_SIZE + ' rows',
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
        name: 'finding(raw) ' + SMALL_SAMPLE_SIZE + ' rows',
        fn: function(deferred) {
          models.user.findAll({
            raw: true,
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
        name: 'finding(plain) ' + SMALL_SAMPLE_SIZE + ' rows',
        fn: function(deferred) {
          models.user.findAll({
            plain: true,
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
        name: 'finding ' + SMALL_SAMPLE_SIZE + ' rows with join',
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
      .on('start', function(event) {
        Utils.log(`Starting ${event.currentTarget.name}`);
      })
      .on('cycle', function(event) {
        Utils.log(String(event.target)
          + ` (mean ${event.target.times.period.toFixed(6)}s)`
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
