#!/usr/bin/env node

const json2bash = require('@code_monk/json2bash');
//const json = require('./package.json');
const json = require('../sample.json');
var r = json2bash(json, 'PKG')
console.log("\nExports:\n",r.export());
console.log("\nDeclares:\n",r.declare());
console.log("\nOneline:\n",r.oneLine());

console.log("\n#####With sub level object")
const json2 = require('../samplelevel.json');
var r2 = json2bash(json2, 'PKG')
console.log(r2.export()
);


function code_monk__json2bash(jsonpath, outprefix = "", capitalized = true) {

	const _json2bash = require('@code_monk/json2bash');

	const _json = require(jsonpath);
	var _r = _json2bash(_json, outprefix);
	var _txt = 	_r.export();
	if (!capitalized) _txt = _txt.toLowerCase();
	console.log(_txt
	);
}
console.log("_--------------------------------------")
code_monk__json2bash("../sample.json","lowcase",false);
console.log("_--------------------------------------")
code_monk__json2bash("../samplesublevel.json","SUBLEVEL");


function code_monk__json2bashV2(jsonpath, outprefix = "", varcase="original") {

	const _json2bash = require('../repo_code_monk/index');
	//console.log(_json2bash);
	
	const _json = require(jsonpath);
	var _r = _json2bash(_json, outprefix,{varcase:varcase});
	var _txt = 	_r.export();
//	if (!capitalized) _txt = _txt.toLowerCase();
	console.log(_txt	);
}
function pline(tag){
	console.log(`-------------${tag}----------`)

}
function testingmany(samplepath)
{
	console.log("---------------------------")
	pline(samplepath)
 pline("LOW");
	code_monk__json2bashV2(samplepath,"lowcase","low");
  pline("CAP")
	code_monk__json2bashV2(samplepath,"cap","cap");
	pline("ORI")
	code_monk__json2bashV2(samplepath,"ori","ori");
pline("LOW no PREFIX")
	code_monk__json2bashV2(samplepath,"","low");
	
  pline("CAP no PREFIX")
	code_monk__json2bashV2(samplepath,"","cap");
	pline("ORI no PREFIX")
	code_monk__json2bashV2(samplepath);
	
}
testingmany("../sample.json")
testingmany("../samplelevel.json")
testingmany("../samplesublevel.json")