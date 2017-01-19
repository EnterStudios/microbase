/*
 The module should add this to the index.js:
 const raven = require('raven');
 const base = require('microbase')({ extra: { raven } });
 */
module.exports = (base) => {
  const url = base.config.get('transports:http:monitors:sentry:url');
  if (!url) {
    return () => {
      base.logger.error('[http] sentry properties not configured');
    };
  }
  base.extra.raven.disableConsoleAlerts();
  base.extra.raven.config(url, {
    autoBreadcrumbs: true,
    captureUnhandledRejections: true,
    release: `${base.config.get('info:package:name')}@${base.config.get('info:package:commit')}`
  }).install();
  return (app, place) => {
    if (place === 'beforeRoutes') {
      if (!base.extra.raven) {
        base.logger.error('[sentry] raven package not installed');
        return;
      }
      app.use(base.extra.raven.requestHandler());
    } else if (place === 'beforeErrorHandlers') {
      if (!base.extra.raven) {
        base.logger.error('[sentry] raven package not installed');
        return;
      }
      app.use((err, req, res, next) => {
        if (err) {
          base.extra.raven.mergeContext({
            tags: {
              // 'x-request-id': req.headers['x-request-id'],
              service: `${base.config.get('services:name')}:${base.config.get('services:version')}`,
              mbversion: base.config.get('info:microbase:version'),
              package: `${base.config.get('info:package:name')}@${base.config.get('info:package:version')}`
            }
          });
        }
        next(err);
      });
      app.use(base.extra.raven.errorHandler());
    }
  };
};