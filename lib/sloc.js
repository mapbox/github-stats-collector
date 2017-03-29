const exec = require('child_process').exec;

function countLinesOfCode(repoPath, cb) {
  const cmd = `cloc --exclude-dir node_modules --json ${repoPath}`
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      console.log(`exec err: ${err}`);
      return cb(err);
    }
    try {
      const result = JSON.parse(stdout);
      return cb(null, result);
    } catch(err) {
      return cb(null, 0);
    }
  });
}

module.exports = countLinesOfCode;
