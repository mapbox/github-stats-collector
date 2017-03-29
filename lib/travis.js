const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');


function findTravisConfig(repoPath, cb) {
  fs.readFile(path.join(repoPath, '.travis.yml'), 'utf8', function (err, data) {
    if (err) {
      //Travis file does not exist
      return cb(null, null);
    } else {
      try {
        const travisConfig = yaml.safeLoad(data);
        return cb(null, travisConfig);
      } catch(err) {
        // Can not parse YAML file
        return cb(null, null);
      }
    }
  });
}

module.exports = findTravisConfig;
