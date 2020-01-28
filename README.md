# VCS Getter
[![Build Status](https://travis-ci.org/OleConsignado/vcs-getter.svg?branch=master)](https://travis-ci.org/OleConsignado/vcs-getter)

VCS Getter provides a simple interface designed to get partial content from Version Control System repositories (currently supports Git and TFS).


## Installation

VCS Getter is available as [npm package](https://www.npmjs.com/package/vcs-getter).

```
$ npm install vcs-getter
```

**Important note**: VCS Getter depends on Git and TFS clients. 
- Git: https://git-scm.com/downloads
- Cross-platform TFS client: https://msdn.microsoft.com/en-us/library/hh873092(v=vs.120).aspx



## Usage example

```javascript
const { VCSGetter } = require('vcs-getter');

// Instantiate it
const vcs = new VCSGetter({
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

// Use it
vcs.get("https://github.com/OleConsignado/vcs-getter/tree/master/README.md")
    .then(r => "Contents downloaded to: " + console.log(r.localPath))
    .catch(e => console.error(e));
```
