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

describe('Cache', () => {
  it('should create a cache', (done) => {
    base.cache
      .create('test')
      .then((cache) => {
        expect(cache).to.be.an.object();
        expect(cache.get).to.be.a.function();
        const cacheAgain = base.cache.get('test');
        expect(cacheAgain).to.be.an.object();
        expect(cacheAgain.get).to.be.a.function();
        done();
      });
  });
  it('should store an item in a simple key', (done) => {
    const cacheName = 'test';
    const cacheExpires = 500;
    const cacheOptions = { expiresIn: cacheExpires };
    const key = 'key1';
    const value = 'value';
    base.cache
      .create(cacheName, cacheOptions)
      .then(cache => cache.set(key, value))
      .then(() => base.cache.get(cacheName))
      .then(cache => cache.get(key))
      .then((cahedValue) => {
        expect(value).equals(cahedValue);
        done();
      })
      .catch(err => console.log(err))
  });
  it('should expire an item in a simple key', (done) => {
    const cacheName = 'test';
    const cacheExpires = 500;
    const cacheOptions = { expiresIn: cacheExpires };
    const key = 'key1';
    const value = 'value';
    base.cache
      .create(cacheName, cacheOptions)
      .then(cache => cache.set(key, value))
      .then(() => base.cache.get(cacheName))
      .then(cache => cache.get(key))
      .then((cachedValue) => {
        expect(value).equals(cachedValue);
        setTimeout(() => {
          return Promise.resolve(base.cache.get(cacheName))
            .then(cache => cache.get(key))
            .then((cachedValue) => {
              expect(cachedValue).to.equal(null);
              done();
            })
        }, cacheExpires + 100);
      })
      .catch(err => done(err));
  });
  it('should store an item in a hierarchical key', (done) => {
    const cacheName = 'test';
    const cacheExpires = 500;
    const cacheOptions = { expiresIn: cacheExpires };
    const key = 'key1';
    const subkey = 'key2';
    const value = 'value';
    base.cache
      .create(cacheName, cacheOptions)
      .then(cache => cache.set(`${key}:${subkey}`, value))
      .then(() => base.cache.get(cacheName))
      .then(cache => cache.get(`${key}:${subkey}`))
      .then((cahedValue) => {
        expect(cahedValue).equals(value);
        done();
      })
      .catch(err => done(err));
  });
});
