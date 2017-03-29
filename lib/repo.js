const d3 = require("d3-queue");
const colors = require('colors/safe');
const github = require("./auth");
const githubStats = require('./github');
const cloneStats = require('./clone');

exports.getAllUserRepoStats = getAllUserRepoStats;

/**
 * Enumerate all repos a user has access to and filter out repos
 * not owned by that user.
 */
function getRepos(username, cb) {
  var repos = [];
  const req = github.repos.getAll({
    per_page: 100,
    sort: 'created',
    direction: 'asc',
  }, getPagedRepos);

  function getPagedRepos(err, res) {
      if (err) return cb(err);
      repos = repos.concat(res.data.filter(function(repo) {
        return repo.owner.login === username;
      }));
      if (github.hasNextPage(res)) {
          github.getNextPage(res, getPagedRepos)
      } else {
          return cb(null, repos);
      }
  }
};

/**
 * Gather statistics for all repos for a given user or organization
 */
function getAllUserRepoStats(username, concurrency, from, to, repoCallback, finishedCallback) {
  getRepos(username, function(err, repos) {
    console.log('Fetched', repos.length, 'repos');
    if (from && to) {
      repos = repos.filter((_, i) => i >= from && i < to);
      console.log('Work through repo', from, 'to', to);
    }

    if (err) return finishedCallback(err);
    const q = d3.queue(concurrency);
    const getStats = (repo, cb) => {
      getRepoStats(repo, (err, stats) => {
        repoCallback(err, stats);
        cb(null, stats);
      })
    };
    repos.filter(r => !r.fork).forEach((r) => q.defer(getStats, r));
    q.awaitAll(finishedCallback);
  });
}

/**
 * Gather all statistics for a GitHub repo from both Github and by cloning
 * and analyzing the repo
 */
function getRepoStats(repo, cb) {
  // TODO: Again - such bad error handling
  const errors = [];
  githubStats(repo.owner.login, repo.name, (err, ghStats) => {
    if(err) errors.push(err);
    cloneStats(repo.owner.login, repo.name, repo.ssh_url, (err, fsStats) => {
      if(err) errors.push(err);
      const firstError = errors.length ? errors[0] : null;
      return cb(firstError, Object.assign({}, repo, ghStats, fsStats));
    })
  });
}
