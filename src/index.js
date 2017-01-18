const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = function (options = {}) {
  const base = {
    extra: options.extra
  };

  // Fake log until the logger is activated
  base.log = (level, msg) => {
    const levels = {
      debug: '\u001b[34mdebug\u001b[39m',
      warn: '\u001b[33mwarn\u001b[39m',
      info: '\u001b[32minfo\u001b[39m',
      error: '\u001b[31merror\u001b[39m'
    };
    console.log(`${new Date().toISOString()} - ${levels[level]}: [${os.hostname()}] ${msg}`);
  };

  const configFiles = options.configFiles || [];
  if (!options.configFiles) {
    base.log('info', '[main] using default configuration files');
    const rootPath = path.dirname(require.main.filename);
    if (process.env.LOCAL_CONFIG_FILE) {
      configFiles.push(process.env.LOCAL_CONFIG_FILE);
    }
    if (fs.existsSync(`${rootPath}/extra.json`)) {
      configFiles.push(`${rootPath}/extra.json`);
    }
    configFiles.push(`${rootPath}/config/${process.env.NODE_ENV || 'development'}.json`);
    configFiles.push(`${rootPath}/config/defaults.json`);
  }
  base.config = options.config || require('./modules/config')(configFiles, base);
  Object.keys(options.configObject || {}).forEach((k) => {
    base.config.set(k, (options.configObject || {})[k]);
  });

  // Log service start
  const info = base.config.get('info');
  base.log('info', `[main] Package ${info.package.name}@${info.package.version} starting (Microbase ${info.microbase.version}) ${info.package.commit || ''}`);

  // Util service
  base.utils = options.utils || require('./modules/utils')(base);

  // Logger service
  base.logger = options.logger || require('./modules/logger')(base);

  // Logstash depends on logger
  base.logstash = options.logstash || require('./modules/logstash')(base);

  // Cache service
  base.cache = options.cache || require('./modules/cache')(base);

  // Bus service
  base.bus = options.bus || require('./modules/bus')(base);

  // Database service
  base.db = options.db || require('./modules/db')(base);

  // Search service
  base.search = options.search || require('./modules/search')(base);

  // Transports
  base.transports = {};
  base.transports.http = (options.transports && options.transports.http)
    ? options.transports.http : require('./modules/transports/http.js')(base);
  base.transports.amqp = (options.transports && options.transports.amqp)
    ? options.transports.amqp : require('./modules/transports/amqp.js')(base);

  // Services service
  base.services = options.services || require('./modules/services')(base);

  // Workers service
  base.workers = options.workers || require('./modules/workers')(base);

  base.shutdown = () => {
    base.logger.info('[main] Received kill signal, shutting down gracefully.');
    base.transports.http.server.close(function () {
      base.logger.info('[main] Closed out remaining connections.');
      process.exit();
    });

    // if after
    setTimeout(function () {
      base.logger.warn('[main] Could not close connections in time, forcefully shutting down.');
      process.exit();
    }, 10 * 1000);
  };

  // listen for TERM signal .e.g. kill
  process.on('SIGTERM', base.shutdown);

  // listen for INT signal e.g. Ctrl-C
  process.on('SIGINT', base.shutdown);

  return base;
};
