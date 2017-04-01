# GitHub Stats Collector [![Build Status](https://travis-ci.org/mapbox/github-stats-collector.svg?branch=master)](https://travis-ci.org/mapbox/github-stats-collector)

Collect repository statistics, issues and comments for all repositories in a GitHub organization.
It also clones and analyzes the codebase for certain properties like lines of code.
All information is stored in a line-delimited JSON file where each repository is a JSON object.

## Usage

```bash
npm install -g @mapbox/github-stats-collector
```

### Dependencies

`git` needs to be able to ssh clone all your repositories in GitHub.

Make sure you have `cloc` installed with `brew install cloc` or `npm install -g cloc`.
This is used to count single lines of code in your repos.
Make sure you expose a `GITHUB_ACCESS_TOKEN` with access to your repository data.

```bash
export GITHUB_ACCESS_TOKEN=23adfxadfasdf...
```

### Fetch Stats

Fetch all repositories and store them in a file.

```
collect-repos -u mapbox -o repos.json
```

Fetch GitHub statistics for all repos in the input file and store them in a new JSON file.

```
collect-repo-stats -i repos.json -u mapbox -o repos.json
```


**Pitfalls:**
- This will hammer the GitHub API to get statistics about your repositories. If you have more than a thousand repos you will hit the GitHub API rate limit
- If you have very large repositories the cloning will timeout and you won't get code statistics
- The GitHub API does not always have the statistics ready but will only start to [calculate them once you request them](https://developer.github.com/v3/repos/statistics/#a-word-about-caching). The program tries to retry operations until it get's statistics. However GitHub might not populate the cache fast enough. Just run it a second time afterwards when GitHub has populated the statistics cache.
