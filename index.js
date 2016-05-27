'use strict';

process.env.DEBUG = process.env.DEBUG || 'sequelize:perf*';

/** Sequelize Benchmark **/
require('./lib').run();
