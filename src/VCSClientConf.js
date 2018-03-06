const { GitTreeConf } = require("./git");
const { TFSConf, TFSCollection } = require("./tfs");


class VCSClientConf {
	constructor({ git, tfs }) {
		this.git = new GitTreeConf(git);
		this.tfs = new TFSConf(tfs);
		this.tfs.collections = [];
		for(let collection of tfs.collections) {
			this.tfs.collections.push(new TFSCollection(collection));
		}
	}
}

module.exports = VCSClientConf;