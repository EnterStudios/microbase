const Code = require('code');
const Lab = require('lab');
const nock = require('nock');
const sinon = require('sinon');

// shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach = lab.beforeEach;
const after = lab.after;
const it = lab.it;
const expect = Code.expect;

const numberFromFile = __filename
  .slice(__dirname.length + 1, -3)
  .split('')
  .reduce((port, char) => {
    return port += char.charCodeAt(0);
  }, 0);

// Randomize http port
process.env.transports_http_port = 3000 + numberFromFile;

const fakeBase = {
  log: (level, msg) => {
    console.log(`${new Date().toISOString()} - ${level}: [] ${msg}`);
  }
};

const base = require('../index.js')({
  config: require('../modules/config')([
    './test/config.json'
  ], fakeBase)
});
//base.config.set('revokedListActive', false);

describe('inMiddleware', () => {
  it('eventEmmiter should emit an event', (done) => {
    const params = { a: 1 };
    const channel = 'TEST';
    const handler = require('../modules/services/inMiddlewares/eventEmitter')(base)
      .handler({ channel });
    base.bus.subscribe(`${channel}.*`, (msg) => {
      expect(msg).to.equal({ data: params });
      done();
    });
    handler(params, undefined, undefined, () => {
    });
  });
  it('validator should validate correct parameters', (done) => {
    const params = { cartId: '001', firstName: 'John', lastName: 'Doe' };
    const handler = require('../modules/services/inMiddlewares/validator')(base)
      .handler({ schema: require('./schemas/testSchema') });
    handler(params, undefined, undefined, () => {
      done();
    });
  });
  it('validator should validate required parameter', (done) => {
    const params = { cartId: '001', firstName: 'John' };
    const expectedError = {
      ok: false,
      error: 'validation_error',
      data: ['payload: should have required property \'lastName\'']
    };
    const handler = require('../modules/services/inMiddlewares/validator')(base)
      .handler({ schema: require('./schemas/testSchema') });
    handler(params, (error) => {
      expect(error).equals(expectedError);
      done();
    }, undefined, () => {
      done('shouldn\'t be here');
    });
  });

  it('cache should return cached response', (done) => {
    const params = { id: 1 };
    const expectedResponse = { hitTimes: 1 };
    const cacheExpires = 1000;
    const cacheOptions = {
      options: {
        expiresIn: cacheExpires
      },
      name: 'test',
      keyGenerator: payload => payload.id
    };
    const handler = require('../modules/services/inMiddlewares/cache')(base)
      .handler(cacheOptions);

    let hitTimes = 0;
    const originalFn = (params, reply) => {
      hitTimes += 1;
      reply({ hitTimes });
    };

    // Call the handler
    handler(
      params,
      function reply(responsea) {
        expect(responsea).equal(expectedResponse);
        // Call again the handler after some time to allow the cache to store the value
        setTimeout(() => {
          handler(
            params,
            responseb => {
              expect(responseb).equal(expectedResponse);
              done();
            },
            { headers: [] },
            newReply => originalFn(params, newReply)
          );
        }, 500);
      },
      { headers: [] },
      newReply => originalFn(params, newReply)
    );

  });
});
