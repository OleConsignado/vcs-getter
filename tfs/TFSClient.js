const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { Utility } = require('../shared');
const TFSCollection = require('./TFSCollection.js');
const TFSConf = require('./TFSConf.js');

class TFSClient {

	constructor({ tfsCollection, tfsConf }) {
		this.collection = new TFSCollection(tfsCollection);

		if(tfsConf) {
			this.conf = new TFSConf(tfsConf);
		} else {
			this.conf = new TFSConf({});
		}

		this._initialized = false;
		this._initializing = false;
	}

	get tfCommandBase() {
		
		if(!this._initialized && !this._initializing) {
			throw new Error("TFSClient was not initialized. Have you called and awaited for TFSClient.initialize?");
		}

		return `${this.conf.tfCommand} -login:${this.collection.user},${this.collection.passwd} -collection:${this.collection.url}`;
	}

	get isInitialized() {
		return this._initialized;
	}

	async initialize() {

		if(!this._initialized) {
			this._initializing = true;
			await this._createWorkspaceIfNotExists();
			this._initialized = true;			
			this._initializing = false;
		}
	}

	async _createWorkspaceIfNotExists() {
		const workspace = this.collection.workspace;

		if(!fs.existsSync(workspace.localPathBase)) {

			console.info('Creating workspace ...');

			fs.mkdirSync(workspace.localPathBase, 0o700);

			try {
				await exec(`${this.tfCommandBase} workspaces ${workspace.name}`);
			} catch(e) {
				if(Utility.contains(`${e.stdout}${e.stderr}`, 'no workspace matching'))
				{
					// cria o workspace
					await exec(`${this.tfCommandBase} workspace -new -location:server -permission:Private ${workspace.name}`);
					console.info(`Workspace '${workspace.name}' was created.`);
				} else {
					fs.rmdirSync(workspace.localPathBase);
					throw new Error(`Could not create workspace: ${util.inspect(e, false, null)}`);
				}
			}
		}
	}
}

module.exports = TFSClient;
