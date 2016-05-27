'use strict';

const Utils = require('../utils')
    , samplesize = require('lodash.samplesize')
    , microtime = require('microtime')
    , COUNT_MAX = 5000
    , SAMPLE_SIZE = 1500;

/**
* Various benchmark for findAll method
*/
let count = 0, totalTime = 0;

module.exports = function(models) {

  let usernames = [], profiles = [];

  for (let i = 1; i < 15000; i++) {
    usernames.push({ username: 'username-' + Math.round(Math.random() * 10000000000) });
    profiles.push({
      email: 'email-' + Math.round(Math.random() * 10000000000),
      amount: (Math.random() * 10000000000),
      userId: i
    });
  }

  let beginTime = 0;

  return models.user
  .bulkCreate(usernames)
  .then(() => {
    return models.profile.bulkCreate(profiles);
  })
  .then(() => {
    profiles = null;
    let utest = samplesize(usernames, SAMPLE_SIZE).map((u) => u.username);
    beginTime = Utils.markEvent('findAll Start');
    return findUsers(models.user, utest);
  })
  .then(() => {
    Utils.markEvent('findAll Ends');
    Utils.log('Total time : ' + (microtime.now() - beginTime) / 1000 + ' ms');
    Utils.log('Avg time : ' + (totalTime/count) / 1000 + ' ms');
    Utils.log(`Test runs : ${count} finding ${SAMPLE_SIZE} elements in each`);

    //reset
    count = 0, totalTime = 0;
    return Promise.resolve();
  })
  .then(() => {
    let utest = samplesize(usernames, SAMPLE_SIZE).map((u) => u.username);
    beginTime = Utils.markEvent('findAll(include:required) Start');
    return findUsers(models.user, utest, [ { model: models.profile, required: true } ]);
  })
  .then(() => {
    Utils.markEvent('findAll(include:required) Ends');
    Utils.log('Total time : ' + (microtime.now() - beginTime) / 1000 + ' ms');
    Utils.log('Avg time : ' + (totalTime/count) / 1000 + ' ms');
    Utils.log(`Test runs : ${count} finding ${SAMPLE_SIZE} elements in each`);
  });
};

/**
*
* Find Users
*
*/
const findUsers = function(user, usernames, include) {
  include = include || [];
  let lastEvent = microtime.now();
  return user.findAll({
    where: {
      username: usernames
    },
    include: include
  }).then(function() {
    if (count < COUNT_MAX) {

      //log progress
      if(count%100 == 0)
        process.stdout.write('.');

      count++;
      totalTime += (microtime.now() - lastEvent);

      return findUsers(user, usernames);
    } else {
      process.stdout.write('\r\n');
      return Promise.resolve();
    }
  });
};
