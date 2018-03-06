const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const fs = require('fs');
const { Utility } = require('../shared');
const GitTreeConf = require('./GitTreeConf.js');
const GitTreeSource = require('./GitTreeSource.js');

class GitTree {

	constructor({ gitTreeConf, gitTreeSource }) {
		if(gitTreeConf)
			this._gitTreeConf = new GitTreeConf(gitTreeConf);
		else
			this._gitTreeConf = new GitTreeConf({});

		this._gitTreeSource = new GitTreeSource(gitTreeSource);
	}

	get _localPath() {

		if(!this.__localPath) {
			let localFolderName = Utility
				.md5(`${this._gitTreeSource.repository}0${this._gitTreeSource.branch}1${this._gitTreeSource.path}`);
			this.__localPath = path.join(this._gitTreeConf.localPathBase, 
				localFolderName);
		}

		return this.__localPath;
	}


	get _remote() {

		if(!this._gitTreeSource.repository.match(/^https?:\/\//)) {
			throw new Error(`Cant access repository: '${this._gitTreeSource.repository}'; Only http(s) protocol is supported.`);
		}

		let result;

		const credential = this._gitTreeConf.credentials.getCredentialFor(this._gitTreeSource.repository);

		if(credential != null) {
			result = this._gitTreeSource.repository
				.replace(/^(https?:\/\/)(.*)/, `$1${credential}@$2`);
		} else {
			result = this._gitTreeSource.repository;
		}

		return result;
	}

	get _treeID() {
		return `${this._gitTreeSource.repository}${this._gitTreeSource.branch}${this._gitTreeSource.path}`;
	}

	async get() {
		
		let changedSinceLastGet = false;

		const branchIDFilename = path.join(this._localPath, '.vcs-branch-name');
		const treeIDFilename = path.join(this._localPath, '.vcs-tree-id');

		if(!fs.existsSync(this._localPath)) {

			changedSinceLastGet = true;
			console.info(`Initializing local git repository at ${this._localPath} ...`);
			fs.mkdirSync(this._localPath, 0o700);

			await exec(`${this._gitTreeConf.gitCommand} init`, { cwd: this._localPath });

			console.info(`Adding remote origin '${this._gitTreeSource.repository}'.`);
			await exec(`${this._gitTreeConf.gitCommand} remote add -f origin ${this._remote}`, { cwd: this._localPath });

			if(this._gitTreeSource.path) {
				await exec(`${this._gitTreeConf.gitCommand} config core.sparseCheckout true`, { cwd: this._localPath });
				fs.writeFileSync(path.join(this._localPath, '.git/info/sparse-checkout'), this._gitTreeSource.path);
			}
			
			console.info(`Pulling contents ...`);
			await exec(`${this._gitTreeConf.gitCommand} pull origin master`, { cwd: this._localPath });

			console.info(`Checking out ${this._gitTreeSource.branch}.`);
			const { stdout, stderr } = await exec(`${this._gitTreeConf.gitCommand} checkout ${this._gitTreeSource.branch}`, { cwd: this._localPath });

			if(!Utility.contains(`${stdout}${stderr}`, 'detached head')) {
				fs.writeFileSync(branchIDFilename, this._gitTreeSource.branch);
			} 

			fs.writeFileSync(treeIDFilename, this._treeID);
		} else {
			
			if(fs.readFileSync(treeIDFilename) != this._treeID) {
				throw new Error(`The path '${this._localPath}' contents not match to this repository. Try to remove directory '${this._localPath}' and try again.`);
			}

			try {
				const branch = fs.readFileSync(branchIDFilename);
				const { stdout, stderr } = await exec(`${this._gitTreeConf.gitCommand} pull origin ${branch}`, { cwd: this._localPath });		

				if(!Utility.contains(`${stdout}${stderr}`, 'already up-to-date')) {
					changedSinceLastGet = true;
					console.info(`Local content was changed.`);
				} else {
					console.info(`No changes since previous get.`);
				}

			} catch(e) {
				if(e.code != 'ENOENT') {
					throw e;
				}

				console.info(`No changes. This tree is immutable.`);
			}
		}

		const localPath = path.join(this._localPath, this._gitTreeSource.path);

		return {
			changedSinceLastGet: changedSinceLastGet,
			localPath: localPath
		}
	}
}

module.exports = GitTree;
