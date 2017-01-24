const base = require('microbase')({
  configFiles: [
    `${__dirname}/config/${process.env.NODE_ENV || 'development'}.json`,
    `${__dirname}/config/defaults.json`
  ]
});

base.services.addOperationsFromFolder(`${__dirname}/operations`);