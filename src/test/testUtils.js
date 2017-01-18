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

describe('Utils', () => {
  it('should extract schema validation errors', (done) => {
    const msg = 'should have required property \'title\'';
    const error = {
      name: 'ValidationError',
      errors: [{
        keyword: 'required',
        dataPath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'title' },
        message: msg
      }]
    };

    const errorList = base.utils.extractErrors(error);
    expect(errorList).to.be.a.array().and.to.have.length(1);
    expect(errorList[0]).to.be.equal(`payload: ${msg}`);
    done();
  });
  it('should extract mongoose validation errors', (done) => {
    const msg = 'Cast to Number failed for value \'A\' at path \'stockStatus\'';
    const error = {
      message: 'Product validation failed',
      name: 'ValidationError',
      errors: {
        stockStatus: {
          message: msg,
          name: 'CastError',
          kind: 'Number',
          value: 'A',
          path: 'stockStatus',
          reason: {
            message: msg,
            name: 'CastError',
            kind: 'number',
            value: 'A',
            path: 'stockStatus'
          }
        }
      }
    };
    const errorList = base.utils.extractErrors(error);
    expect(errorList).to.be.a.array().and.to.have.length(1);
    expect(errorList[0]).to.be.equal(`stockStatus: ${msg}`);
    done();
  });
  it('should load modules from a folder', (done) => {
    const modules = base.utils.loadModulesFromFolder('${rootPath}/test/loadModules');
    expect(modules).to.be.a.array().and.to.have.length(2);
    expect(modules[0]).to.be.an.object();
    expect(modules[0].module).to.be.a.function();
    done();
  });
  it('should load modules from folder, key overwriting', (done) => {
    const modules = base.utils.loadModulesFromFolder('${rootPath}/test/loadModules');
    expect(modules).to.be.a.array().and.to.have.length(2);
    expect(modules[0]).to.be.an.object();
    expect(modules[0].module).to.be.a.function();
    expect(modules[0].module()).contains('moduleOverwritten');
    done();
  });
  it('should load modules from key', (done) => {
    const modules = base.utils.loadModulesFromKey('services:operations');
    expect(modules).to.be.a.array().and.to.have.length(1);
    expect(modules[0]).to.be.an.object();
    expect(modules[0].module).to.be.a.function();
    done();
  });
  it('should log a warn on load a module from inexistent key', (done) => {
    const spy = sinon.spy(base.logger, 'warn');
    const module = base.utils.loadModule('test:loadModule:nonExistentKey');
    expect(module).to.be.null();
    expect(spy.getCall(0).args[0]).equals('[modules] module \'test:loadModule:nonExistentKey\' not found');
    base.logger.warn.restore();
    done();
  });
  it('should log an error on load an inexistent module', (done) => {
    const spy = sinon.spy(base.logger, 'error');
    const module = base.utils.loadModule('test:loadModule:nonExistentModule');
    expect(module).to.be.null();
    expect(spy.getCall(0).args[0]).equals('[modules] module \'test:loadModule:nonExistentModule:nonExistentModule\' not found (Cannot find module \'nonExistentModule\')');
    base.logger.error.restore();
    done();
  });
  it('should load a module from key, dot', (done) => {
    const module = base.utils.loadModule('test:loadModule:moduleDot');
    expect(module).to.be.an.object();
    expect(module.module).to.be.a.function();
    done();
  });
  it('should load a module from key, no dot', (done) => {
    const module = base.utils.loadModule('test:loadModule:moduleNoDot');
    expect(module).to.be.an.object();
    expect(module.module).to.be.a.string();
    done();
  });
  it('should generate an generic error response on ValidationError', (done) => {
    const msg = 'Cast to Number failed for value \'A\' at path \'stockStatus\'';
    const error = {
      message: 'Product validation failed',
      name: 'ValidationError',
      errors: {
        stockStatus: {
          message: msg,
          name: 'CastError',
          kind: 'Number',
          value: 'A',
          path: 'stockStatus',
          reason: {
            message: msg,
            name: 'CastError',
            kind: 'number',
            value: 'A',
            path: 'stockStatus'
          }
        }
      }
    };
    const expectedResponse = {
      error: 'validation_error',
      data: ['stockStatus: Cast to Number failed for value \'A\' at path \'stockStatus\'']
    };
    const response = base.utils.genericErrorResponse(error);
    expect(response).to.equal(expectedResponse);
    done();
  });
  it('should generate an generic error response on Mongo DuplicateKey error', (done) => {
    const error = {
      errmsg: 'Duplicate key',
      code: 11000,
      name: 'MongoError'
    };
    const expectedResponse = { error: 'duplicate_key', data: 'Duplicate key' };
    const response = base.utils.genericErrorResponse(error);
    expect(response).to.equal(expectedResponse);
    done();
  });
  it('should generate an generic error response', (done) => {
    const spy = sinon.spy(base.logger, 'error');
    const error = {
      code: 'an error',
      data: { number: 1 },
      statusCode: 404,
      log: true,
      stack: 'stackTrace...'
    };
    const expectedResponse = { error: 'an_error', data: { number: 1 }, statusCode: 404 };
    const response = base.utils.genericErrorResponse(error);
    expect(response).to.equal(expectedResponse);
    expect(spy.getCall(0).args[0]).equals('an error {"number":1}');
    expect(spy.getCall(1).args[0]).equals('stackTrace...');
    base.logger.error.restore();
    done();
  });
});
