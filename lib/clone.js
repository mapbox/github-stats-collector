const tmp = require('tmp');
const rimraf = require('rimraf');
const exec = require('child_process').exec;
const colors = require('colors/safe');
const d3 = require("d3-queue");

const execFile = require('child_process').execFile;
const countLinesOfCode = require('./sloc');
const findTravisConfig = require('./travis');
const findPackageConfig = require('./package');

/**
 * Clone repository and execute external tools to
 * analye the directory containing the cloned repo files
 */
function cloneRepoStats(owner, repoName, cloneUrl, cb) {
  const tmpDir = tmp.dirSync();
  var timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    console.log(colors.red(`${owner}/${repoName} cloning timed out`));
    cb(null, null);
  }, 300 * 1000);

  execFile('git', ['clone', '--depth', 1, cloneUrl, tmpDir.name], (err) => {
    if (timedOut) return;
    if (err) return cb(err);
    clearTimeout(timeout);

    d3.queue()
      .defer(countLinesOfCode, tmpDir.name)
      .defer(findTravisConfig, tmpDir.name)
      .defer(findPackageConfig, tmpDir.name)
      .await((err, cloc, travisConfig, packageConfig) => {
        if(err) {
          rimraf(tmpDir.name, () => {});
          return cb(err, {
            cloc: null,
            travis: null,
            'package': null
          });
        }
        console.log(`${owner}/${repoName} count lines of code ${cloc ? cloc.SUM.code : 0}`);
        console.log(`${owner}/${repoName} find ${travisConfig ? 1 : 0} travis.yaml`);
        console.log(`${owner}/${repoName} find ${packageConfig ? 1 : 0} package.json`);
        rimraf(tmpDir.name, () => {});
        return cb(null, {
          cloc: cloc,
          travis: travisConfig,
          'package': packageConfig
        });
      });
  });
}


module.exports = cloneRepoStats;
