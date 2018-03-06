const GitCredentials = require('./GitCredentials.js');

class GitTreeConf {
	constructor({ gitCommand = 'git', localPathBase = '/tmp', credentials = null }) {
		this.gitCommand = gitCommand;
		this.localPathBase = localPathBase;
		this.credentials = new GitCredentials(credentials);
	}
}

module.exports = GitTreeConf;
