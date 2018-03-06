class TFSWorkspace {
	constructor({name, localPathBase}) {
		if(!name)
			throw new Error("TFSWorkspace -> missing name");

		this.name = name;

		if(!localPathBase)
			throw new Error("TFSWorkspace -> missing localPathBase");

		this.localPathBase = localPathBase;
	}
}


module.exports = TFSWorkspace;
