class GitCredentials {

	// Expected credentials form is:
	//
	//	 {
	//		'https://xxx.visualstudio.com': 'token|user:password',
	//      'http://github.com': 'user:password',
	//		...
	// 	 }
	// 
	constructor(credentials) {
		if(credentials) {
			for(let key of Object.keys(credentials)) {
				this[key] = credentials[key];
			}

			this._credentials = credentials;
		}
	}

	getCredentialFor(repository) {
		if(this._credentials) {
			const matches = repository.match(/https?:\/\/[^\/]+/);
			
			if(matches) {
				const repo = matches[0];
				return this._credentials[repo] || this._credentials[`${repo}/`];
			}
		}

		return null;
	}
}

module.exports = GitCredentials;
