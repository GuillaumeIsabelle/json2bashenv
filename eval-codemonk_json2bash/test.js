#!/usr/bin/env node

const json2bash = require('@code_monk/json2bash');
//const json = require('./package.json');
const json = require('../sample.json');
var r =json2bash(json,'PKG')
console.log(r.export()
);
console.log("\n#####With sub level object")
const json2 = require('../samplelevel.json');
var r2 =json2bash(json2,'PKG')
console.log(r2.export()
);