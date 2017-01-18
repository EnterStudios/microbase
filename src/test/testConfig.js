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

// Used in 'should return a correct env value'
process.env.test_value = 'testValue';

const fakeBase = {
  log: (level, msg) => {
    console.log(`${new Date().toISOString()} - ${level}: [] ${msg}`);
  }
};

const spy = sinon.spy(fakeBase, 'log');

const base = require('../index.js')({
  config: require('../modules/config')([
    './test/config.json',
    './test/fake.json'
  ], fakeBase)
});

fakeBase.log.restore();

describe('Config', () => {
  it('should handle a config file not found as a log', (done) => {
    expect(spy.getCall(3).args[0]).equals('error');
    expect(spy.getCall(3).args[1]).contains('[File doesn\'t exist]');
    done();
  });
  it('should return a correct value', (done) => {
    const value = base.config.get('services:defaultOperationsFolder');
    expect(value).to.equal('${servicePath}/operations');
    done();
  });
  it('should return a correct env value', (done) => {
    const value = base.config.get('test:value');
    expect(value).to.equal('testValue');
    done();
  });
});

