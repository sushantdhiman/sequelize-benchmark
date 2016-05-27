## Sequelize Benchmark

Benchmark which is used to record sequelize performance trends.

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
`VERBOSE`, Log the tests after each 100th run

```

### Usage

Open your local `sequelize` development path 
```bash
  cd /path/to/sequelize
```

Link current repo with `sequelize` symlink
```bash
  npm link
```

Clone the repository via 
```bash
  git clone https://github.com/sushantdhiman/sequelize-benchmark
```

Open the `sequelize-benchmark` path 
```
  cd /path/to/sequelize-benchmark
```

Install required node modules
```bash
  npm install
```

Now use the `sequelize` from your local path
```bash
  npm link sequelize
```

Run benchmark
```bash
  npm start
```

