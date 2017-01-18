const path = require('path');
const Brakes = require('brakes');
const cls = require('continuation-local-storage');

module.exports = function (base) {

  const ns = cls.getNamespace('microbase') || cls.createNamespace('microbase');

  const service = {
    name: base.config.get('services:name'),
    version: base.config.get('services:version'),
    operations: new Map(),
    splitOperationName: name => {
      const s = name.split(':');
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
    },
    getOperationFullName: (serviceName, serviceVersion, operationName) =>
      `${serviceName}:${serviceVersion}:${operationName}`
  };

  // Circuit breakers for out calls
  const circuits = {};

  // Add inMiddlewares
  const inMiddlewaresFns = new Map();
  const inMiddlewares = [];

  base.utils.loadModulesFromKey('services:inMiddlewares').forEach(inMiddleware => {
    const middlewareName = inMiddleware.keys[inMiddleware.keys.length - 1];
    base.logger.info(`[services] loading in middleware '${middlewareName}'`);
    inMiddlewares.push(middlewareName);
    inMiddlewaresFns.set(middlewareName, inMiddleware.module);
  });

  // Add middlewares to operations
  function addInMiddlewares(operationFullName, op) {
    for (let w = inMiddlewares.length; w > 0; w--) {
      const middlewareName = inMiddlewares[w - 1];
      if (op[middlewareName] || middlewareName.indexOf('system-') === 0) {
        // Apply the middleware if we have a configuration or is a system one
        const middleware = inMiddlewaresFns.get(middlewareName);
        const originalFn = op.handler;
        const handler = middleware.handler(op[middlewareName] || { operationFullName });
        op.handler = function (params, reply, request) {
          handler(params, reply, request, function next(newReply) {

            function replyHandler(response) {
              // Special care with the custom reply exceptions
              if (newReply) {
                try {
                  newReply(response);
                } catch (err) {
                  reply(base.utils.genericResponse(null, {
                    message: err.message,
                    statusCode: 500,
                    stack: err.stack
                  }));
                }
              } else {
                reply(response);
              }
            }

            originalFn(params, replyHandler, request);
          });
        };
      }
    }
    return op;
  }

  // Add operation method
  const defaultTransports = base.config.get('services:defaultTransports');
  service.addOperation = function (op, transports = defaultTransports) {
    const operationFullName = service.getOperationFullName(service.name, service.version, op.name);
    base.logger.info(`[services] added service [${operationFullName}]`);
    service.operations.set(operationFullName, addInMiddlewares(operationFullName, op));
    const usedTransports = op.transports || transports;
    usedTransports.forEach(transport => {
      base.transports[transport].use(operationFullName, op);
    })
  };

  // Add all the operations inside a module
  service.addOperations = function (module, transports = ['http']) {
    for (let op of module) {
      service.addOperation(op, transports);
    }
  };

  // For given folder name each file exports an operation. Name resolved to filename if no one is provided
  const defaultOperationsFolder = base.config.get('services:defaultOperationsFolder');
  service.addOperationsFromFolder = (folder = defaultOperationsFolder, transports) => {
    const modules = base.utils.loadModulesFromFolder(folder);
    modules.forEach((operation) => {
      if (operation.module) {
        operation.module.name = operation.module.name || path.basename(operation.file, '.js');
        service.addOperation(operation.module, transports);
      }
    });
  };

  // Default transport for out calls
  const defaultOutTransport = base.config.get('services:defaultOutTransport');

  // Call transport out middleware
  function callTransportOutMiddleware(context, next) {
    // Promise call
    const promiseCall =
      transport =>
        function (data) {
          return base.transports[transport]
            .call(data.config, data.msg);
        };

    const transport = context.config.transport || defaultOutTransport;
    let circuit = circuits[context.config.name];
    if (!circuit) {
      // TODO: move this values to the config file
      const options = {
        name: context.config.name,
        statInterval: 2500,
        threshold: 0.25,
        circuitDuration: 5000,
        timeout: 250,
        waitThreshold: 3
      };

      Object.assign(options, context.config.circuitbreaker || {});

      if (options.fallback) {
        const sourceFn = options.fallback;
        options.fallback = function (context) {
          return new Promise((resolve, reject) => {
            ns.run(function () {
              ns.set('x-request-id', context.headers['x-request-id']);
              ns.set('authorization', context.headers['authorization']);
              resolve(sourceFn(context));
            });
          });
        };
      }
      circuit = new Brakes(promiseCall(transport), options);

      circuit.on('failure', () => {
        base.logger.error(`[service] Circuit breaker failure for ${context.config.name}`);
      });

      circuit.on('circuitOpen', () => {
        base.logger.error(`[service] Circuit breaker opened for ${context.config.name}`);
      });

      circuit.on('circuitClosed', () => {
        base.logger.warn(`[service] Circuit breaker closed for ${context.config.name}`);
      });

      // circuit.on('timeout', (e) => {
      //   base.logger.warn(`[service] timeout for ${context.config.name} ${e}`);
      // });
      // circuit.on('snapshot', (s) => {
      //   if (s.stats.failed !== 0 || s.stats.timedOut !== 0) {
      //     base.logger.warn(`[service] stats for ${context.config.name} f:${s.stats.failed} + to:${s.stats.timedOut} / s:${s.stats.successful} l:${s.stats.latencyMean}`);
      //   }
      // });

      circuits[context.config.name] = circuit;
    }
    context.headers = {
      'x-request-id': ns.get('x-request-id'),
      'authorization': ns.get('authorization')
    };
    circuit.exec(context)
      .then(response => {
        if (response.ok === false && response.error !== 'circuitbreaker') {
          return next(base.utils.Error(response.error, response.data));
        }
        context.response = response;
        return next();
      })
      .catch(error => {
        ns.run(function () {
          ns.set('x-request-id', context.headers['x-request-id']);
          ns.set('authorization', context.headers['authorization']);
          context.response = {
            ok: false,
            error: 'circuitbreaker',
            data: {
              code: error.code || error.constructor.name.toLowerCase(),
              service: context.config.name
            }
          };
          next();
        });
      });
  }

  // Create the out calls chain
  const callChain = new base.utils.Chain().use('services:outMiddlewares');
  callChain.use(callTransportOutMiddleware);

  // Call other services
  service.call = (config, msg) =>
    callChain
      .exec({ config, msg })
      .then(context => context.response);

  // Add a ping operation to allow health checks and keep alives
  service.addOperation({
    name: 'micro.ping',
    transports: ['http'],
    public: true,
    handler: (msg, reply) => {
      return reply({ answer: 'pong' });
    }
  });

  // Add the monitoring hystrix streams
  const globalStats = Brakes.getGlobalStats();
  service.addOperation({
    name: 'micro.hystrix',
    transports: ['http'],
    public: true,
    handler: (msg, reply, req, res) => {
      res.setHeader('Content-Type', 'text/event-stream;charset=UTF-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      globalStats.getHystrixStream().pipe(res);
      return;
    }
  });

  if (base.logger.isDebugEnabled()) {
    service.addOperation({
      name: 'micro.config',
      transports: ['http'],
      public: true,
      handler: (msg, reply) => {
        return reply({ answer: base.config.get() });
      }
    });
  }

  return service;
};
