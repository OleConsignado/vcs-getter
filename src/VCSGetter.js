const VCSSource = require('./VCSSource.js');
const VCSGetterConf = require('./VCSGetterConf.js');
const util = require('util');
const { GitTree } = require('./git');
const { TFSClient, TFSFolder } = require('./tfs');

class VCSGetter {

	constructor(conf) {
		this.conf = new VCSGetterConf(conf);
	}

	_findTfsCollection(collectionUrl) {
		for(let i = 0; i < this.conf.tfs.collections.length; i++) {
			if(collectionUrl == this.conf.tfs.collections[i].url || `${collectionUrl}/` == this.conf.tfs.collections[i].url) {
				return this.conf.tfs.collections[i];
			}
		}

		throw new Error(`Could not find configuration for collection '${collectionUrl}'`);
	}

	async get(source) {
		let vcsSource;

		if(typeof source == 'string') {
			vcsSource = new VCSSource({ url: source });	
		} else {
			vcsSource = new VCSSource(source);
		}

		switch(vcsSource.type) {
			case 'git':
				const gitTree = new GitTree({
					gitTreeSource: vcsSource.source,
					gitTreeConf: this.conf.git
				});

				return await gitTree.get();
			case 'tfs':
				const tfsClient = new TFSClient({
					tfsConf: this.conf.tfs,
					tfsCollection: this._findTfsCollection(vcsSource.source.collection)
				});
				const tfsFolder = new TFSFolder(tfsClient, vcsSource.source.path);

				return tfsFolder.get();
				break;
			default:
				throw new Error(`Unexpected vcsSource.type: ${vcsSource.type}`);
		}
	}
}

module.exports = VCSGetter;
