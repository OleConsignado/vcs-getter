const TFSWorkspace = require('./TFSWorkspace.js');

class TFSCollection {
	constructor({ url, user, passwd, workspace }) {

		if(!url)
			throw new Error("TFSCollection -> missing url");

		this.url = url;

		if(!user)
			throw new Error("TFSCollection -> missing user");

		this.user = user;

		if(!passwd)
			throw new Error("TFSCollection -> missing passwd");

		this.passwd = passwd;

		if(!workspace)
			throw new Error("TFSCollection -> missing workspace");

		this.workspace = new TFSWorkspace(workspace);
	}
}

module.exports = TFSCollection;
