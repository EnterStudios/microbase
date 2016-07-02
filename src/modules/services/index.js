const Hapi = require('hapi');
const Wreck = require('wreck');
const AuthJWT = require('hapi-auth-jwt');
const uuid = require('node-uuid').v4;
const sessionCache = require('session-cache');

// TODO: Refactor to split the service and the transports

module.exports = function (base) {

  const service = {
    name: base.config.get('services:name'),
    version: base.config.get('services:version'),
    operations: new Set()
  };

  const wreck = Wreck.defaults({
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const gatewayHost = base.config.get('gateway:host');
  const gatewayPort = base.config.get('gateway:port');
  const gatewayBasePath = base.config.get('gateway:path');
  const gatewayUrlOverrride = base.config.get('gateway:gatewayUrlOverrride');
  const remoteCallsTimeout = base.config.get('gateway:timeout');
  let getGatewayBaseUrl;
  if (gatewayUrlOverrride) {
    getGatewayBaseUrl = base.utils.loadModule('gateway:gatewayUrlOverrride');
  } else {
    const gatewayBaseUrl = `http://${gatewayHost}:${gatewayPort}`;
    getGatewayBaseUrl = () => gatewayBaseUrl;
  }

  const serviceBasePath = base.config.get('services:path');

  const getOperationUrl = (basePath, serviceName, serviceVersion, operationName, operationPath) =>
    `${basePath}/${serviceName}/${serviceVersion}${operationPath !== undefined ? operationPath : '/' + operationName}`;
  const getOperationFullName = (serviceName, serviceVersion, operationName) =>
    `${serviceName}:${serviceVersion}:${operationName}`;
  const splitOperationName = name => {
    const s = name.split(':')
    let serviceName, serviceVersion = 'v1', operationName;
    if (s.length === 1) {
      serviceName = operationName = s[0];
    } else if (s.length === 2) {
      serviceName = s[0];
      operationName = s[1];
    } else {
      serviceName = s[0];
      serviceVersion = s[1];
      operationName = s[2];
    }
    return { serviceName, serviceVersion, operationName };
  };

  const server = service.server = new Hapi.Server();
  server.connection({
    host: base.config.get('services:host'),
    port: base.config.get('services:port'),
    routes: { cors: true }
  });

  // Custom error responses
  server.ext('onPreResponse', (request, reply) => {

    const response = request.response;
    if (!response.isBoom) {
      return reply.continue();
    }

    if (response.data) {
      Object.assign(response.output.payload, response.data);
      response.reformat();
    }

    return reply(response);
  });

  server.register([
    {
      register: require('ratify'),
      options: {}
    }, {
      register: require('good'),
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          console: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', request: '*', response: '*', error: '*' }]
          }, {
            module: 'good-console'
          }, 'stdout']
        }
      }
    }], (err) => {
    if (err) {
      throw err; // something bad happened loading the plugin
    }
    server.start((err) => {
      if (err) {
        throw err;
      }
      base.logger.info(`[server-http] running at: [${server.info.uri}${base.config.get('services:path')}]`);
    });
  });

  // Verify jwt token
  server.register(AuthJWT, (err) => {
    const token_signingKey = base.config.get('token:secretKey');
    server.auth.strategy('jwt', 'jwt', {
      key: token_signingKey,
      verifyOptions: { algorithms: ['HS256'] },
      validateFunc: function (request, decodedToken, callback) {
        // DB token search and clean.
        //  base.db.models.Token
        //  .findById(verifiedJwt.body.jti)
        //  .exec()
        //  .then(token => {
        //    if (!token) return callback(null, false);
        //    if (new Date() > token.expirationDate) {
        //      token.remove();
        //      return callback(null, false)
        //    } else {
        //      return callback(null, true, {
        //        clientId: decodedToken.sub,
        //        scope: decodedToken.scope
        //      });
        //    }
        //  })
        //  .catch(error => {
        //    return callback(error, false);
        //  });
        return callback(null, true, {
          clientId: decodedToken.sub,
          scope: [decodedToken.scope]
        });
      }
    });
  });

  // Call internal or external services
  service.call = function (config, msg) {

    // Get default headers from session
    const headers = {
      'x-request-id': session.get('x-request-id'),
      authorization: session.get('authorization')
    };
    Object.assign(headers, config.headers);

    let {serviceName, serviceVersion, operationName} = splitOperationName(config.name);
    const operationFullName = getOperationFullName(serviceName, serviceVersion, operationName);
    const operationMethod = config.method || 'POST';
    if (service.operations.has(operationFullName)) {
      // Its a local service
      const operationUrl = getOperationUrl(serviceBasePath, serviceName, serviceVersion, operationName, config.path);
      if (base.logger.isDebugEnabled()) base.logger.debug(`[services] calling [${operationMethod}] ${operationUrl} with ${JSON.stringify(msg)}`);
      return server.inject({
        url: operationUrl,
        payload: msg,
        method: config.method || 'POST',
        headers: headers
      }).then(response => {
        //return Promise.resolve(response.result, response);
        return new Promise(resolve => {
          return resolve(response.result, response);
        });
      });
    } else {
      // It's a remote operation
      return new Promise((resolve, reject) => {
        const operationUrl = getOperationUrl(getGatewayBaseUrl(serviceName, serviceVersion, operationName) + gatewayBasePath, serviceName, serviceVersion, operationName, config.path);
        if (base.logger.isDebugEnabled()) base.logger.debug(`[services] calling [${operationMethod}] ${operationUrl} with ${JSON.stringify(msg)}`);
        wreck.request(
          operationMethod,
          operationUrl,
          {
            payload: JSON.stringify(msg),
            headers: headers,
            timeout: config.timeout || remoteCallsTimeout
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
  };

  // Routes configuration
  const routeConfig = (schema, scope) => {
    return {
      plugins: {
        ratify: schema || {}
      },
      auth: {
        strategy: 'jwt',
        scope: scope
      }
    }
  };

  // Cache responses
  server.ext('onPreResponse', (request, reply) => {
    const response = request.response;
    if (response.isBoom || !request.headers['mb-cache']) {
      return reply.continue();
    }
    const cache = base.cache.get(request.headers['mb-cache']);

    cache.set(request.headers['mb-cache-key'], {
      statusCode: response.statusCode || 200,
      payload: response.source
    });
    return reply.continue();
  });

  // Routes handler
  const routeHandler = (cacheOptions, handler) => {
    return (request, reply) => {
      // Mix body payload/params/query
      let payload = request.payload || {};
      Object.assign(payload, request.params);
      Object.assign(payload, request.query);
      // Create CID
      if (!request.headers['x-request-id']) {
        request.headers['x-request-id'] = uuid();
      }
      // Store CID & Authorization token in session
      session.set('x-request-id', request.headers['x-request-id']);
      session.set('authorization', request.headers['authorization']);

      // Cache the results id configured
      if (cacheOptions) {
        const key = cacheOptions.keyGenerator ? cacheOptions.keyGenerator(payload) : base.utils.hash(payload);

        // Verify the no-cache header to bypass the cache
        let noStore = false;
        if (request.headers['cache-control']) {
          noStore = Wreck.parseCacheControl(request.headers['cache-control'])['no-store'];
        }
        if (noStore) {
          // Set the headers to store the result
          request.headers['mb-cache'] = cacheOptions.name;
          request.headers['mb-cache-key'] = key;
          // Execute the operation
          return handler.call(this, payload, reply, request);
        }

        // Try to get the result from cache
        const cache = base.cache.get(cacheOptions.name);
        cache.get(key)
          .then((value) => {
            if (value) {
              // If the result was on the cache, just return it.
              return reply(value.item.payload).code(value.item.statusCode || 200);
            }
            // The result was not in the cache, set the headers to store the result
            request.headers['mb-cache'] = cacheOptions.name;
            request.headers['mb-cache-key'] = key;
            // Execute the operation
            return handler.call(this, payload, reply, request);
          })
          .catch(error => {
            return reply(err);
          });
      } else {
        // The operation is not cacheable
        return handler.call(this, payload, reply, request);
      }
    };
  };

  // Routes style
  const routesStyle = base.config.get('services:style');

  // Add operation method
  service.add = function (op) {
    const operationFullName = getOperationFullName(service.name, service.version, op.name);
    let operationUrl, operationMethod;
    if (routesStyle === 'REST') {
      // REST style
      operationUrl = getOperationUrl(serviceBasePath, service.name, service.version, op.name, op.path);
      operationMethod = op.method || 'POST';
    } else {
      // RPC style
      operationUrl = getOperationUrl(serviceBasePath, service.name, service.version, op.name, undefined);
      operationMethod = 'POST';
    }
    const defaultScope = base.config.get('auth:scope');
    base.logger.info(`[services] added service [${operationFullName}] in [${operationMethod}][${operationUrl}]`);
    // Add the operation to this service operations
    service.operations.add(operationFullName);
    // Create cache
    if (op.cache) {
      op.cache.name = op.cache.name || operationFullName;
      base.cache.create(op.cache.name, op.cache.options);
    }
    // Add the Hapi route, mixing parameters and payload to call the handler
    server.route({
      method: operationMethod,
      path: operationUrl,
      handler: routeHandler(op.cache, op.handler),
      config: op.config || routeConfig(op.schema, op.scope || defaultScope)
    });
  };

  // Add all the operations inside a module
  service.addModule = function (module) {
    for (var op of module) {
      service.add(op);
    }
  };

  // Add a ping operation to allow health checks and keep alives
  service.add({
    name: 'ping',
    method: 'GET',
    config: {},
    handler: (msg, reply) => {
      return reply({ answer: 'pong' });
    }
  })

  // session-cache to store authorization and CID
  var session = sessionCache('microbase');

  return service;
};
