#   json2bash

Useful for CLIs, build scripts, CI scripts, or anywhere where your node app and surrounding bash scripts need to share state.

##  usage

Create an executable script like this, called something like "getenv"

```javascript
#!/usr/bin/env node

const json2bash = require('@code_monk/json2bash');
const json = require('./package.json');
console.log(
    json2bash(json,'FOO')
);
```

Now call it from your bash script like this:


```sh
#!/bin/bash

eval "$(./getenv)"

echo "lets now look at our environment vars prefixed sith FOO"

env | grep FOO
```

The result looks like this

```text
lets now look at our environment vars prefixed sith FOO
FOO_NAME=@sean9999/json2bash
FOO_KEYWORDS_4=environment
FOO_REPOSITORY_TYPE=git
FOO_KEYWORDS_5=import
FOO_LICENSE=ISC
FOO_KEYWORDS_2=variable
FOO_KEYWORDS_3=variables
FOO_VERSION=1.0.2
FOO_KEYWORDS_0=bash
FOO_KEYWORDS_1=package.json
FOO_BUGS_URL=https://gitlab.com/code_monk/json2bash/issues
FOO_AUTHOR=Sean Macdonald <sean@crazyhorsecoding.com>
FOO_REPOSITORY_URL=git+ssh://git@gitlab.com/code_monk/json2bash.git
FOO_HOMEPAGE=https://gitlab.com/code_monk/json2bash#README
FOO_SCRIPTS_TEST=echo Error:
FOO_MAIN=index.js
FOO_DESCRIPTION=Allows you to import json files (such as package.json) into bash scripts.

```