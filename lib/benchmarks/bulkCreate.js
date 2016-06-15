'use strict';

/**
* Module to benchmark bulkCreate function
*/
const Benchmark = require('benchmark')
    , Utils = require('../utils');

const ULTRA_SAMPLE_SIZE = process.env.ULTRA_SAMPLE_SIZE || 100000
    , LARGE_SAMPLE_SIZE = process.env.LARGE_SAMPLE_SIZE || 10000
    , SMALL_SAMPLE_SIZE = process.env.SMALL_SAMPLE_SIZE || 1500;

/**
 * Create sample test data
 *
 * @return {Array}
 */
const createTestData = (sampleSize) => {
  let usernames = [];

  sampleSize = sampleSize || 1500;

  for (let i = 1; i < sampleSize; i++) {
    usernames.push({ username: 'username-' + Math.round(Math.random() * 10000000000) });
  }

  return usernames;
};

/**
 * Init models with sample data, prepare search sample
 */
const setup = (models, sequelize) => {
  let ultraSet = createTestData(ULTRA_SAMPLE_SIZE)
     , largeSet = createTestData(LARGE_SAMPLE_SIZE)
     , smallSet = createTestData(SMALL_SAMPLE_SIZE);

  return sequelize.sync({ force: true })
  .then(() => {
    return sequelize.Promise.resolve([ultraSet, largeSet, smallSet]);
  });
};

module.exports = function(models, sequelize) {
  let testPromise = sequelize.Promise.defer()
  , bulkCreateSuite = new Benchmark.Suite('bulkCreate');

  let smallSample, largeSample, ultraSample;

  setup(models, sequelize)
    .spread(function(u, l, s){
      ultraSample = u;
      largeSample = l;
      smallSample = s;

      bulkCreateSuite
      .add({
        defer: true,
        name: 'bulkCreate#' + ULTRA_SAMPLE_SIZE,
        fn: function(deferred) {
          models.user.bulkCreate(ultraSample)
          .then(() => {
            deferred.resolve();
          });
        }
      })
      .add({
        defer: true,
        name: 'bulkCreate#' + LARGE_SAMPLE_SIZE,
        fn: function(deferred) {
          models.user.bulkCreate(largeSample)
          .then(() => {
            deferred.resolve();
          });
        }
      })
      .add({
        defer: true,
        name: 'bulkCreate#' + SMALL_SAMPLE_SIZE,
        fn: function(deferred) {
          models.user.bulkCreate(smallSample)
          .then(() => {
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
