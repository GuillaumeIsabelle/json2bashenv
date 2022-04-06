#!/usr/bin/env node
'use strict';


var path = require('path');

const fs = require('fs');


var args = process.argv.slice(2);

//add --help as first args if no argument is given
if (!args || args.length == 0 || args[0] == "--help")
  process.argv[2] = "--help";



const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')



var appStartMessage =
  `-------------------------
json2bash
By Guillaume Descoteaux-Isabelle, 2022 
----------------------------------------`;
var { argv, exit } = require('process');
// const { exit } = require("node-process");
const helpExample = `  `;

argv =
  yargs(hideBin(process.argv))

    .scriptName("json2bash")
    .command('<jsonFile> "[objArray]"')
    .usage(appStartMessage + helpExample)
    .epilogue('for more information, find our manual at https://github.com/GuillaumeIsabelle/json2bashenv#readme')

    .option('tolower', {
      default: false,
      type: 'boolean',
      alias: ['tl', 'toLowerCase', 't', 'lc'],
      description: 'Changes env name to lowercase'
    })
    .option('prefix', {
      alias: ['p', 'px'],
      default: false,
      type: 'boolean',
      description: 'prefix selected object output to var'
    })
    .option('onlyselected', {
      alias: ['o', 'os', 'oa'],
      default: false,
      type: 'boolean',
      description: 'select only value of obj array as arg 2'
    })
    .option('verbose', {
      alias: 'v',
      default: false,
      type: 'boolean',
      description: 'Run with verbose logging'
    })
    // .option('fileout',
    //   {
    //     alias: ['f', 'o','fo','out'],
    //     default: "",
    //     type : 'string',
    //     description: "define an output file.  default: to std out"
    //   })
    .option('debug', {
      alias: 'd',
      default: false,
      type: 'boolean',
      description: 'Run with debug output'
    })
    .example("json2bash samplelevel.json --tolower", "simple output")
    .example("json2bash samplelevel.json \"result\" --tolower", "extract the tag result")
    .example("json2bash samplelevel.json \"result\" --tolower --oa --prefix", "extract the tag result only (no top level prop will output)")
    .example("json2bash samplelevel.json \"result,stuff\" --tolower --prefix", "Extract the result and stuff object to lowercase and add their object name as prefix to variable")
    .argv;

//-----------

var d = argv.debug;
var var2Lower = argv.tolower;
var prefix = argv.prefix;
var onlyselected = argv.onlyselected;
// var fileout = argv.fileout;
var config = null;





try {

  var tst = require('dotenv').config()
  if (tst.parsed) {
    config = new Object()
    var { json2bashtofile, json2bashtofilepath } = tst.parsed;

  }


} catch (error) { }


try {

  if (d) console.log(argv);

  var filein = argv._[0];
  var level = "";



  let rawdata = fs.readFileSync(filein);
  let jsonObject = JSON.parse(rawdata);

  if (d) console.log(jsonObject.PublicIp)

  if (argv._[1]) level = argv._[1];
  var out = [];
  var c = 0;
  Object.entries(jsonObject).forEach(entry => {
    const [key, value] = entry;
    var outKey = key;


    var t = typeof (value);
    if (d) console.log(t);

    var l = level.split(",");
    if (d) console.log(l);
    // console.log(level);
    // exit();

    if (t != "object") {
      if (d) console.log(key.trim(), "=", value.trim());
      if (var2Lower) outKey = key.toLowerCase();

      if (!onlyselected)
        out[c] = "export " + outKey + "=\"" + value.trim() + "\"";
    }
    else {
      if (d) console.log("Special parsing, we have an objcet")
      l.forEach(kl => {
        //console.log(kl);
        if (key == kl) {
          if (d) console.log(key, ":", kl);
          var prefixKey = kl;

          parseObject2Bash(value, kl);
        }
      });

    }
    c++;
  });
  if (d) console.log("-------------")
  if (d) console.log(out)
  out.forEach(element => {
    console.log(element)
  });


} catch (error) {
  console.log("Must specify a file as first args")
  console.log(error)

}





/**
 * Parse object 2 bash function
 * 
 * @param {*} jsonObject 
 * @param {*} oLevelName 
 */
function parseObject2Bash(jsonObject, oLevelName = "") {

  if (d) console.log("olevel:", oLevelName);
  if (d) console.log(jsonObject);

  var i = 0;
  var out = [];

  Object.entries(jsonObject).forEach(entry => {
    const [key, value] = entry;

    if (d) console.log(key.trim(), "=", value.trim());

    var outKey = key;
    if (var2Lower) outKey = key.toLowerCase();

    var t = typeof (value);
    if (d) console.log("f:", t);
    var prefixVal = "";

    if (prefix) prefixVal = oLevelName;

    if (t != "object") {
      var v = "" + value;

      out[i] = "export "
        + prefixVal
        + outKey
        + "=\""
        + v.replace(/(?:\r\n|\r|\n)/g, '\\n') + "\"";
    }

    i++;
  });
  out.forEach(element => {
    console.log(element)
  });
}