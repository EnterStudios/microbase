const Ajv = require('ajv');

module.exports = (base) => {
  return {
    handler: (options) => {
      const ajv = new Ajv();
      const validate = ajv.compile(options.schema);
      return (params, reply, request, next) => {
        if (!validate(params)) {
          return reply(base.utils.genericResponse(null, {
            name: 'ValidationError',
            errors: validate.errors
          }));
        }
        return next();
      };
    }
  };
};
