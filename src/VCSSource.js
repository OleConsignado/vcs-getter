const util = require('util');
const { GitTreeSource } = require('./git');

class VCSSource {

	get _suportedTypes() {
		return [ 'auto', 'git', 'tfs' ];
	}

	_parseGitUrl(url) {
		const matches = url.match(/(https?:\/\/.*?)\/(tree|blob)\/([^\/]+)\/?(.*)/);
		const result = {};

		if(matches) {
			result.repository = matches[1];
			result.branch = matches[3];
			result.path = matches[4];
		} else {
			throw new Error(`Could not parse url '${url}'. Expected url form is: 'http[s]:// repository / tree|blob / branch|commit|tag / [path-to-dir-or-file]'. Note that only http(s) protocol is supported.`);
		}

		return new GitTreeSource(result);
	}

	_parseTfsUrl(url) {
		const matches = url.match(/(https?:\/\/.*?)\/(\$.*)/);
		const result = {};

		if(matches) {
			result.collection = matches[1];
			result.path = matches[2];
		} else {
			throw new Error(`Could not parse url '${url}'. Expected url form is: 'http[s]:// collection / $/path-to-dir-or-file'.`);
		}

		return result;
	}

	constructor({ url, type = 'auto' }) {
		if(!url)
			throw new Error("VCSSource -> Param url is required.");

		this.url = url;
		
		if(this._suportedTypes.indexOf(type) == -1)
			throw new Error(`VCSSource -> Param type must be one of: ${util.inspect(this._suportedTypes)}.`);

		if(type == 'auto') {
			try {
				this.source = this._parseGitUrl(url);
				this.type = 'git';
			} catch(e) {
				try {
					this.source = this._parseTfsUrl(url);
					this.type = 'tfs';
				} catch(e) {
					throw new Error(`VCSSource -> Could not discover vcs type for url: '${url}'.`);
				}
			}
		} else {
			this.type = type;

			switch(this.type) {
				case 'git':
					this.source = this._parseGitUrl(url);
					break;
				case 'tfs':
					this.source = this._parseTfsUrl(url);
					break;
			}
		}
	}
}

module.exports = VCSSource;
