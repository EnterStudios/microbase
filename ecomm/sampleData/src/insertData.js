const fs = require('fs');
const readline = require('readline');

// Verify parameters
var args = process.argv.slice(2);

if (args.length != 2) {
  console.error('No parameters passed');
  console.log('Usage: node insertData.js entity file');
  console.log('Example: node insertData.js Tax ./data/dataTaxes.json');
  process.exit(1);
}

const entityName = args[0];

const fileName = args[1];
try {
  fs.accessSync(fileName, fs.R_OK);
} catch (error) {
  console.error(`Cannot access file '${fileName}'`);
  process.exit(1);
}

// Instantiate microbase
const base = require('microbase')({
  configFiles: [
    `${__dirname}/config/${process.env.NODE_ENV || 'development'}.json`,
    `${__dirname}/config/defaults.json`
  ],
  configObject: {
    servicePath: __dirname
  }
});
const helper = require('./insertDataHelpers')(base);
if (!helper[`insert${entityName}`]) {
  console.error(`Unrecognized entity '${entityName}'`);
  process.exit(1);
}
const insertFn = helper[`insert${entityName}`];

// Read file line by line

const rl = readline.createInterface({
  input: fs.createReadStream(fileName)
});

const waitToResume = function (rl) {
  if (counter < 10) rl.resume();
  setTimeout(function () {
    waitToResume(rl);
  }, 500);
};

const insertEntity = function (rl, jsonString) {
  counter++;
  const json = JSON.parse(jsonString);
  return insertFn(json)
    .then(response => {
      if (response && response.error) throw(response);
      counter--;
      console.log('Processed', ++processed, ++inserted);
      waitToResume(rl);
    })
    .catch(error => {
      //console.warn('\nProcessed', processed++, inserted, '\n', error.message, '\n', jsonString, '\n');
      console.warn('Processed', ++processed, inserted, jsonString.substring(0, 100));
      console.warn(error);
      counter--;
      if (error.message && error.message === 'duplicate key') {
        return waitToResume(rl);
      }
      //rl.close();
      waitToResume(rl);
    });
};

const wait = function () {
  setTimeout(function () {
    console.log('waiting', counter);
    if (counter == 0) process.exit(0);
    wait();
  }, 500);
};

let jsonString = '';
let counter = 0;
let processed = 0;
let inserted = 0;
rl
  .on('line', line => {

    const trimmedLine = line.trim();
    if (trimmedLine.length == 0) return;
    if (trimmedLine.substring(0, 1) == '#') return;
    if (trimmedLine.substring(0, 2) == '//') return;

    rl.pause();

    if (line.substr(0, 1) === '}') {
      jsonString += line;
      insertEntity(rl, jsonString);
      jsonString = '';
    } else if (line.substr(0, 1) === '{') {
      if (jsonString) {
        insertEntity(rl, jsonString);
        jsonString = line;
      } else {
        jsonString = line;
        rl.resume();
      }
    } else {
      jsonString += line;
      rl.resume();
    }
  })
  .on('close', () => {
    if (jsonString) {
      insertEntity(rl, jsonString);
    }
    wait();
  });

module.exports = base;
