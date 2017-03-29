# GitHub Stats Collector
## Usage

```bash
npm install
```

Make sure you have `cloc` installed with `brew install cloc` or `npm install -g cloc`.
This is used to count single lines of code in your repos.

### Fetch Stats

Dump all GitHub statistics of the organization into a JSON file.
Make sure you expose a `GITHUB_ACCESS_TOKEN` with access to your repository data.


```bash
export GITHUB_ACCESS_TOKEN=23adfxadfasdf...
./bin/repo-stats -u mapbox  -o repostats.json
```

**Pitfalls:**
- This will hammer the GitHub API to get statistics about your repositories. If you have a lot ore than a thousand repos you will hit the GitHub API rate limit
- If you have very large repositories the cloning will timeout and you won't get code statistics
- The GitHub API does not always have the statistics ready but will only start to [calculate them once you request them](https://developer.github.com/v3/repos/statistics/#a-word-about-caching). The program tries to retry operations until it get's statistics. However GitHub might not populate the cache fast enough. Just run it a second time afterwards when GitHub has populated the statistics cache.
