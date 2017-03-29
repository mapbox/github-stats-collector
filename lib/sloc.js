const exec = require('child_process').exec;

function countLinesOfCode(repoPath, cb) {
  const cmd = `cloc --exclude-dir node_modules --json ${repoPath}`
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      console.log(`exec err: ${err}`);
      // This means cloc chocked on something
      return cb(null, null);
    }
    try {
      const result = JSON.parse(stdout);
      return cb(null, result);
    } catch(err) {
      return cb(null, null);
    }
  });
}

module.exports = countLinesOfCode;
