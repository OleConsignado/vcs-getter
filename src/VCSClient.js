class VCSClient {

	constructor(implementation) {
		this._implementation = implementation;	
	}

	async get() {
		return await this._implementation.get();
	}
}

module.exports = VCSClient;