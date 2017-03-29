const github = require("./auth");
const colors = require('colors/safe');
const retry = require('retry');

const operationParams = {
  minTimeout: 5 * 1000,
  retries: 5,
  maxTimeout: 60 * 1000
};

//TODO: Reduce code duplication
function getStatsContributors(params, cb) {
  const operation = retry.operation(operationParams);
  operation.attempt((currentAttempt) => {
    github.repos.getStatsContributors(params, (err, contrib) => {
      if(!err && !contrib.data.length) {
        console.error(colors.yellow(`${params.owner}/${params.repo} no contributor stats on #${currentAttempt} attempt`));
        err = new Error("No contributor stats returned");
      }
      if (operation.retry(err)) return;
      cb(err ? operation.mainError() : null, contrib);
    });
  });
}

//TODO: Reduce code duplication
function getStatsCommitActivity(params, cb) {
  const operation = retry.operation(operationParams);
  operation.attempt((currentAttempt) => {
    github.repos.getStatsCommitActivity(params, (err, commits) => {
      if(!err && !commits.data.length) {
        console.error(colors.yellow(`${params.owner}/${params.repo} no commit stats on #${currentAttempt} attempt`));
        err = new Error("No commit stats returned");
      }
      if (operation.retry(err)) return;
      cb(err ? operation.mainError() : null, commits);
    });
  });
}

function githubStats(owner, repo, cb) {
  const fullName = owner + '/' + repo;
  const params = {
    owner: owner,
    repo: repo
  };
 // TODO: Too stupid to get d3 queue to work so I fallback to callback hell
  github.repos.getLanguages(params, (err, langs) => {
    if(err) cb(err);
    console.log(`${fullName} fetch ${Object.keys(langs.data).length || 0} languages`);
    getStatsContributors(params, (err, contrib) => {
      if(err) cb(err);
      console.log(`${fullName} fetch ${contrib.data.length || 0} contributor activity`);
      getStatsCommitActivity(params, (err, commits) => {
        console.log(`${fullName} fetch ${commits.data.length || 0} weeks of commits`);
        return cb(null, {
          owner: owner,
          name: repo,
          commitActivity: commits.data,
          contributors: contrib.data,
          languages: langs.data,
        });
      });
    });
  });
}

module.exports = githubStats;
