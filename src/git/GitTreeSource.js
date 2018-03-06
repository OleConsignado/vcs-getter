class GitTreeSource
{
	constructor({ repository, path = '', branch }) {
		
		if(!repository)
			throw new Error("GitTreeSource -> missing repository");
		
		this.repository = repository;
		
		this.path = path;

		if(!branch)
			throw new Error("GitTreeSource -> missing branch");
		
		this.branch = branch;
	}
}

module.exports = GitTreeSource;
