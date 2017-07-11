const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');
const shortid = require('shortid');
const cls = require('continuation-local-storage');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const Guard = require('express-jwt-permissions');
const Wreck = require('wreck');
const cors = require('cors');

module.exports = function (base) {

  // request storage
  const ns = cls.getNamespace('microbase') || cls.createNamespace('microbase');

  // Service data
  const serviceBasePath = base.config.get('transports:http:path');
  const serviceName = base.config.get('services:name');
  const serviceVersion = base.config.get('services:version');
  const routesStyle = base.config.get('transports:http:style');

  // External monitors base key
  const monitorsBaseKey = 'transports:http:monitors';

  // Call services variables
  const wreck = Wreck.defaults({
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  const gatewayHost = base.config.get('gateway:host');
  const gatewayPort = base.config.get('gateway:port');
  const gatewayBasePath = base.config.get('gateway:path');
  const gatewayUrlOverride = base.config.get('gateway:gatewayUrlOverride');
  const remoteCallsTimeout = base.config.get('gateway:timeout');
  let getGatewayBaseUrl;
  if (gatewayUrlOverride) {
    getGatewayBaseUrl = base.utils.loadModule('gateway:gatewayUrlOverride').module;
  } else {
    const gatewayBaseUrl = `http://${gatewayHost}:${gatewayPort}`;
    getGatewayBaseUrl = () => gatewayBaseUrl;
  }

  // Helpers
  const getOperationUrl = (basePath, serviceName, serviceVersion, operationName, operationPath) =>
    `${basePath}/${serviceName}/${serviceVersion}/${operationName}${operationPath !== undefined ? operationPath : ''}`;

  const app = express();

  // Load external monitors before any other middleware
  Object.keys(base.config.get(monitorsBaseKey)).forEach((monitorName) => {
    if (base.config.get(`${monitorsBaseKey}:${monitorName}:enabledBeforeRoutes`)) {
      const m = base.utils.loadModule(`${monitorsBaseKey}:${monitorName}:module`);
      if (m) {
        base.logger.info(`[http] activating BeforeRoutes monitor '${monitorName}'`);
        m.module(app, 'beforeRoutes');
      } else {
        base.logger.error(`[http] activating BeforeRoutes monitor '${monitorName}'`);
      }
    }
  });

  // CORS
  const corsOrigin = base.config.get('transports.http.cors.origin');
  app.options('*', cors({ origin: corsOrigin }));
  app.use(cors({ origin: corsOrigin }));

  app.use(bodyParser.json());                         // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  // Overwrite the powered-by header
  app.use(function (req, res, next) {
    res.set('X-Powered-By', 'microbase');
    next();
  });

  const router = express.Router();

  // Log HTTP requests
  app.use(expressWinston.logger({
    winstonInstance: base.logger,
    msg: base.config.get('transports:http:logpattern'),
    meta: false,
    ignoreRoute: function (req, res) {
      return req.url.match(/micro\.ping/);
    }
  }));

  // Load routes
  app.use(router);

  // Load external monitors before any other error Handler
  Object.keys(base.config.get(monitorsBaseKey)).forEach((monitorName) => {
    if (base.config.get(`${monitorsBaseKey}:${monitorName}:enabledBeforeErrorHandlers`)) {
      const m = base.utils.loadModule(`${monitorsBaseKey}:${monitorName}:module`);
      if (m) {
        base.logger.info(`[http] activating BeforeErrorHandlers monitor '${monitorName}'`);
        m.module(app, 'beforeErrorHandlers');
      } else {
        base.logger.error(`[http] activating BeforeErrorHandlers monitor '${monitorName}'`);
      }
    }
  });

  // Error handler for 401s
  app.use(function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ ok: false, error: 'invalid_token' });
    }
    next(err);
  });

  // Log Errors
  app.use(expressWinston.errorLogger({
    transports: [
      new (winston.transports.Console)({
        json: false,
        timestamp: true,
        colorize: true,
        silent: false,
        prettyPrint: true
      })
    ]
  }));

  // Error handler
  app.use(function errorHandler(err, req, res, next) {
    if (err.status) res.statusCode = err.status;
    if (res.statusCode < 400) res.status(500);
    const error = { message: err.message };
    for (let prop in err) error[prop] = err[prop];
    res.json({ ok: false, error: error });
  });

  // HTTP server listen
  const server = app.listen(base.config.get('transports:http:port'), base.config.get('transports:http:host'), function () {
    base.logger.info(`[http] running at ${this.address().address}:${this.address().port}${base.config.get('transports:http:path')}`);
  });

  // Tokens
  const guard = Guard({ permissionsProperty: 'scope' });

  const tokenSecretKey = base.config.get('token:secretKey');
  const tokenIss = base.config.get('token:iss');
  const tokenExtractor = ExtractJwt.fromAuthHeaderWithScheme('Bearer');

  passport.use(new JwtStrategy({
    jwtFromRequest: tokenExtractor,
    secretOrKey: tokenSecretKey,
    issuer: tokenIss
  }, (tokenData, done) => {
    if (tokenData.sub) {
      return done(null, { id: tokenData.sub, scope: tokenData.scope });
    }
    return done(null, false);
  }));
  app.use(passport.initialize());

  // Add operation method
  function use(operationFullName, op) {
    const operationMethod = routesStyle === 'REST' ? (op.method || 'post').toLowerCase() : 'all';
    const operationUrl = getOperationUrl(serviceBasePath, serviceName, serviceVersion, op.name, op.path);
    base.logger.info(`[http] added ${routesStyle} service [${operationFullName}] in [${operationMethod}][${operationUrl}]`);
    const opFn = (req, res, next) => {
      // wrap the events from request and response
      ns.bindEmitter(req);
      ns.bindEmitter(res);
      ns.run(() => {
        const rid = shortid.generate();
        if (req.headers['x-request-id']) {
          req.headers['x-request-id'] = req.headers['x-request-id'] + ':' + rid;
        } else {
          req.headers['x-request-id'] = rid;
        }
        res.set('x-request-id', req.headers['x-request-id']);
        // Store CID & Authorization token in the local storage
        ns.set('x-request-id', req.headers['x-request-id']);
        ns.set('authorization', req.headers['authorization']);
        // Mix body payload/params/query
        const payload = req.body || {};
        Object.assign(payload, req.params);
        Object.assign(payload, req.query);
        // Call the handler
        return op.handler(payload, (response = {}) => {
          return res.status(response.statusCode || 200).json(response);
        }, req, res);
      });
    };
    const middlewares = [];
    if (!op.disableTokenVerification) {
      const authenticationMiddleware = (req, res, next) => {
        passport.authenticate('jwt', function (err, user, info) {
          if (info) return res.status(401).json({ ok: false, error: 'invalid_token' });
          base.tokens
            .isRevoked(tokenExtractor(req))
            .then((isRevoked) => {
              if (isRevoked) return res.status(401).json({ ok: false, error: 'invalid_token' });
              req.user = user;
              return next();
            })
            .catch(next);
        })(req, res, next);
      };

      middlewares.push(authenticationMiddleware);
      if (op.scope) {
        middlewares.push(guard.check(op.scope));
      }
    }
    if (op.inMiddlewares) {
      middlewares.push(op.inMiddlewares);
    }
    middlewares.push(opFn);
    // Add the route, mixing parameters and payload to call the handler
    router[operationMethod](operationUrl, middlewares);
  }

  // Call another services
  function call(config, msg) {
    // Mix default and user headers
    const headers = {
      'x-request-id': ns.get('x-request-id'),
      authorization: ns.get('authorization')
    };
    Object.assign(headers, config.headers);
    const { serviceName, serviceVersion, operationName } = base.services.splitOperationName(config.name);
    const operationMethod = config.method || 'POST';

    return new Promise((resolve, reject) => {
      const operationUrl =
        getOperationUrl(getGatewayBaseUrl(serviceName, serviceVersion, operationName) + gatewayBasePath,
          serviceName, serviceVersion, operationName, config.path);
      if (base.logger.isDebugEnabled()) {
        base.logger.debug(`[http] calling [${operationMethod}] ${operationUrl} with ${JSON.stringify(msg)}`);
      }
      wreck.request(
        operationMethod,
        operationUrl,
        {
          payload: JSON.stringify(msg),
          headers,
          timeout: (config.circuitbreaker || {}).timeout || remoteCallsTimeout
        },
        (error, response) => {
          if (error) return reject(error);
          Wreck.read(response, { json: 'smart' }, (error, payload) => {
            if (error) return reject(error);
            return resolve(payload, response);
          });
        })
      ;
    });

  }

  return {
    app,
    server,
    use,
    call
  };
};
