const os = require('os');
const url = require('url');

/*
 The module should add this to the index.js:
 const dd = require('connect-datadog');
 const base = require('microbase')({ extra: { dd } });
 */
module.exports = (base) => {
  return (app, place) => {
    if (place === 'beforeRoutes') {
      if (!base.extra.dd || base.extra.dogstatsd) {
        base.logger.error('[datadog] datadog package not installed');
        return;
      }
      const DD = base.extra.dogstatsd.StatsD;
      const parsedUrl = url.parse(base.config.get('transports:http:monitors:datadog:url'));
      const dogstatsd = new DD(parsedUrl.hostname, parsedUrl.port);
      base.logger.info(`[datadog] started on ${parsedUrl.hostname}:${parsedUrl.port}`);
      const ddConnection = base.extra.dd({
        dogstatsd,
        response_code: true,
        tags: [
          `service:${base.config.get('services:name')}:${base.config.get('services:version')}`,
          `mbversion:${base.config.get('info:microbase:version')}`,
          `package:${base.config.get('info:package:name')}@${base.config.get('info:package:version')}`,
          `host:${os.hostname()}`
        ]
      });
      app.use(ddConnection);
    }
  };
};
