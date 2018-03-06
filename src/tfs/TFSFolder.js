const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const { Utility } = require('../shared');

class TFSFolder {

	get _localPath() {

		if(!this.__localPath) {
			let sourcePathSanitized = Utility.md5(`${this.tfsClient.collection.url}0${this.sourcePath}`);
			this.__localPath = path.join(this.tfsClient.collection.workspace.localPathBase, 
				sourcePathSanitized);
		}

		return this.__localPath;
	}

	constructor(tfsClient, sourcePath) {

		this.tfsClient = tfsClient;
		const sourcePathParts = sourcePath.split(';');
		this.sourcePath = sourcePathParts[0];
		this.revision = sourcePathParts[1] || 'latest';	

		this._sourceIDFilename = path.join(this._localPath, '.vcs-source-id');
		this._sourceID = `${this.tfsClient.collection.url}0${this.sourcePath}`
	}

	async _createMappingIfNotMapped() {

		if(!this.tfsClient.isInitialized) {
			await this.tfsClient.initialize();
		}

		if(!fs.existsSync(this._localPath)) {

			console.info(`Creating folder mapping for ${this.sourcePath} ...`);
			fs.mkdirSync(this._localPath, 0o700);

			try {
				await exec(`${this.tfsClient.tfCommandBase} workfold -map ${this.sourcePath} ${this._localPath} -workspace:${this.tfsClient.collection.workspace.name}`);
			} catch(e) {
				fs.rmdirSync(this._localPath);
				throw e;
			}

			console.info(`Successfuly mapped: '${this.sourcePath}' -> '${this._localPath}'.`);

			fs.writeFileSync(this._sourceIDFilename, this._sourceID);
		}
	}

	async get() {

		await this._createMappingIfNotMapped();

		if(fs.readFileSync(this._sourceIDFilename) != this._sourceID) {
			throw new Error(`The path '${this._localPath}' contents not match to this repository. Try to remove directory '${this._localPath}' and try again.`);
		}

		let versionArg = "";

		if(this.revision != 'latest') {
			versionArg = ` -version:${this.revision}`
		}

		console.info('Getting ...');

		let { stdout } = await exec(`${this.tfsClient.tfCommandBase} get${versionArg} -recursive ${this._localPath}`);

		let changedSinceLastGet = true;
		if(Utility.contains(stdout, 'all files up to date')) {
			changedSinceLastGet = false;
			console.info('No changes since previous get.');
		} else {
			console.info('Local content was changed.');
		}

		const localPath = this._localPath;

		return {
			changedSinceLastGet: changedSinceLastGet,
			localPath: 	localPath
		}
	}
}

module.exports = TFSFolder;
