## Sequelize Benchmark

Benchmark which is used to record sequelize performance trends.

<p align="center"><img src="http://i.imgur.com/Br9iaiO.png" /></p>

### Config

It support all possible `sequelize` environment configuration. Following `ENV` varibales are available generally

```bash

`SEQ_USER`, Username for database
`SEQ_PW`, Password for database
`SEQ_DB`, Database name
`SEQ_HOST`, Host addresss
`SEQ_POOL_MAX`, Maximum concurrent connection
`SEQ_POOL_MIN`, Minimum concurrent connection
`DIALECT`, Dialect to use , `mysql` default

```

### Usage

```bash
  # Open your local sequelize development path
  cd /path/to/sequelize 

  # Link current repo with sequelize global symlink
  npm link # may be --production as well
  
  # Clone benchmarking repository via
  git clone https://github.com/sushantdhiman/sequelize-benchmark

  # Open the `sequelize-benchmark` path
  cd /path/to/sequelize-benchmark

  # Install required node modules
  npm install

  # Now use the `sequelize` from your local sequelize repository
  npm link sequelize

  # Run benchmark
  npm run <test-mysql | test-pg | test-sqlite | test-pg-native | test-mssql>
```
