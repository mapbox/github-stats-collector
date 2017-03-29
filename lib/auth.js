const GitHubApi = require("github");

const github = new GitHubApi({
    //debug: true,
    protocol: "https",
    host: process.env.API_HOST || "api.github.com",
    headers: {
      "user-agent": "https://github.com/mapbox/github-org-stats"
    },
    timeout: 20000
});

github.authenticate({
  type: "token",
  token: process.env.GITHUB_ACCESS_TOKEN
});

module.exports = github;
