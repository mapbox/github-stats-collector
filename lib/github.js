const github = require("./auth");
const colors = require('colors/safe');
const retry = require('retry');

const operationParams = {
  minTimeout: 5 * 1000,
  retries: 5,
  maxTimeout: 60 * 1000
};

function getComments(params, cb) {
  var comments = [];
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  const req = github.issues.getCommentsForRepo(Object.assign({}, params, {
    per_page: 100,
    since: d
  }), getPagedIssues);

  function getPagedIssues(err, res) {
      if (err) return cb(err);
      comments = comments.concat(res.data);
      if (github.hasNextPage(res)) {
          github.getNextPage(res, getPagedIssues)
      } else {
          return cb(null, comments);
      }
  }
};

function getIssues(params, cb) {
  var issues = [];
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  const req = github.issues.getForRepo(Object.assign({}, params, {
    per_page: 100,
    since: d
  }), getPagedIssues);

  function getPagedIssues(err, res) {
      if (err) return cb(err);
      issues = issues.concat(res.data);
      if (github.hasNextPage(res)) {
          github.getNextPage(res, getPagedIssues)
      } else {
          return cb(null, issues);
      }
  }
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

  const result = {
    owner: owner,
    name: repo,
    issues: [],
    comments: [],
    commitActivity: [],
    contributors: [],
    languages: {},
  };

  const errors = []

  // TODO: Too stupid to get d3 queue to work so I fallback to callback hell
  // TODO: This code duplication is ridiculous.. grow up
  getComments(params, (err, comments) => {
    if(err) errors.push(err);
    result.comments = comments || [];
    console.log(`${fullName} fetch ${result.comments.length} comments`);

    getIssues(params, (err, issues) => {
      if(err) errors.push(err);
      result.issues = issues || [];
      console.log(`${fullName} fetch ${result.issues.length} issues`);

      github.repos.getLanguages(params, (err, langs) => {
        if(err) errors.push(err);
        result.languages = (langs && langs.data) || {};
        console.log(`${fullName} fetch ${Object.keys(result.languages).length} languages`);

        getStatsContributors(params, (err, contrib) => {
          if(err) errors.push(err);
          result.contributors= contrib.data || [];
          console.log(`${fullName} fetch ${result.contributors.length} contributor activity`);

          getStatsCommitActivity(params, (err, commits) => {
            if(err) errors.push(err);
            result.commits = commits.data || [];
            console.log(`${fullName} fetch ${result.commits.length} weeks of commits`);
            return cb(errors.length ? errors[0] : null, result);
          });
        });
      });
    });
  });
}

module.exports = githubStats;
