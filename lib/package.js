const fs = require('fs');
const path = require('path');

function findPackageConfig(repoPath, cb) {
	fs.readFile(path.join(repoPath, 'package.json'), 'utf8', function (err, data) {
		if (err) {
			return cb(null, null);
		} else {
			try {
				const packageJSON = JSON.parse(data);
				return cb(null, packageJSON);
			} catch(err) {
				return cb(err, null);
			}
		}
	});
}

module.exports = findPackageConfig;
