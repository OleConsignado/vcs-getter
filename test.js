#!/usr/bin/env node 

const { VCSGetter } = require('.');
const util = require("util");

vcs = new VCSGetter({
	git: { 
		gitCommand: 'git', // optional (default git)
		localPathBase: "/tmp/git-vcs-test",
		credentials: { 
			"https://***.visualstudio.com": "access-token", // required for private repositories
			"https://###.visualstudio.com": "access-token"
		}	
	},
	tfs: {
		tfCommand: "/opt/TEE-CLC-14.123.1/tf", // optional (default tf)
		collections: [
			{
				url: "https://***.visualstudio.com",
				user: "***",
				passwd: "***",
				workspace: { 
					name: "repo1-workspace-MACHINENAME", 
					localPathBase: "/tmp/tfs01" 
				}
			},
			{
				url: 'http://tfs:8080/tfs',
				user: '***',
				passwd: '***',
				workspace: { 
					name: "repo2-workspace-MACHINENAME", 
					localPathBase: "/tmp/tfs02" 
				}				
			}
		]
	}	
});

const urls = [
	'https://github.com/mnconsulting/vcs-getter/tree/master/README.md'
]

async function test() {
	for(let url of urls) {
		console.log(`++++++ Testing url: '${url}'`);
		const result = await vcs.get(url);;
		console.log(util.inspect(result));
		console.log(`------ Done with '${url}'`);			
	}
}

test().catch(e => console.error(e));
