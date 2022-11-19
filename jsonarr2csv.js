#!/usr/bin/env node
'use strict';


var path = require('path');

const fs = require('fs');


var args = process.argv.slice(2);

//add --help as first args if no argument is given and we are not in a pipeline
var pipeMode = process.stdin._readableState.sync;
//process.stdin.isTTY || process.stdin.isTTY==false? true:false;
//console.log(pipeMode);
if ((!args || args.length == 0 || args[0] == "--help") 
&& pipeMode  == false)
process.argv[2] = "--help";


var { argv, exit } = require('process');



//todo insert "-" as argv[2] if not that value
if (pipeMode)
{
  var al = process.argv.length;// console.log(al);
  if (al> 2)
  {
    var rearg  =[];
    var ii = 0;
    for (let i = 0; i < process.argv.length; i++) {
      const element = process.argv[i];
      var tst = element;
      if (i==2 && tst != "-") //insert "-" at pos 2 of the argv
      {
        rearg[ii] = "-";
        ii++;
      }
      rearg[ii] = tst; 
      ii++;
    }
    process.argv = rearg;
  }
  else process.argv[2] = "-";
}

//console.log(process.argv)
//exit();

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

//if (d)console.log("------------------------")
//if (d)console.log( process.stdin);
//if (d)console.log("------------------------")


var appStartMessage =
  `-------------------------
json2bash
By Guillaume Descoteaux-Isabelle, 2022 
----------------------------------------`;
// const { exit } = require("node-process");
const helpExample = `  `;
var author = "Guillaume Descoteaux-Isabelle";




argv =
yargs(hideBin(process.argv))
    .scriptName("json2bash")
    // .usage(appStartMessage + helpExample)
    .usage('$0 <jsonFile> [objCsvArray] [fileout]', "by " + author + ", 2022", (yargs) => {
      yargs.positional('jsonFile', {
        describe: 'json File input (optional when receiving using pipe)',
        type: 'string',
        default: '-'
      }),
      yargs.positional('objCsvArray', {
        describe: 'object to extract in the file as csv',
        type: 'string',
        default: '.'
      }),
      yargs.positional('fileout', {
        describe: 'env file output',
        type: 'string',
        default: null
      })
    .example("json2bash sample.json --tolower", "simple output")
    .example("json2bash sample.json . outfile.env --tolower", "simple output to file (the dot signify we keep top level element)")
    .example("json2bash samplelevel.json \"result\" --tolower", "extract the tag result")
    .example("json2bash samplelevel.json \"result\" --tolower --oa --prefix", "extract the tag result only (no top level prop will output)")
    .example("json2bash samplelevel.json \"result,stuff\" --tolower --prefix", "Extract the result and stuff object to lowercase and add their object name as prefix to variable")
    .example("json2bash samplesublevelon  \"result\" -p;./json2bash samplesublevelon  \"result\" -p -j |./json2bash \"meta\" -p -l -o", "Complex pipe extracting an object then one of its subobject pipe back to be extracted")
    .example("json2bash samplesublevel.json o.txt --all ", "export all sublevel to a file o.txt")
    .example("json2bash samplesublevel.json o.txt --all --u", "export all sublevel in upper case to a file o.txt")
    .epilogue('for more information, find our manual at https://github.com/GuillaumeIsabelle/json2bashenv#readme')
    .help()
    })
    
    .option('var2Lower', {
      default: false,
      type: 'boolean',
      alias: ['tolower', 'tl', 'toLowerCase', 'lc','l'],
      description: 'Changes env name to lowercase'
    })
    .option('var2Cap', {
      default: false,
      type: 'boolean',
      alias: ['tocap', 'tc', 'toUpperCase', 'uc','u'],
      description: 'Changes env name to uppercase'
    })
    .option('prefix', {
      alias: ['p', 'px'],
      default: false,
      type: 'boolean',
      description: 'prefix selected object output to var'
    })
    .option('all', {
      alias: ['a'],
      default: false,
      type: 'boolean',
      description: 'output all sub object'
    })
    .option('exportprefix', {
      alias: ['x','export'],
      default: false,
      type: 'boolean',
      description: 'output with export before'
    })
    .option('jsonx', {
      alias: ['j','jx'],
      default: false,
      type: 'boolean',
      description: 'output sub object as json'
    })
    .option('onlyselected', {
      alias: ['o', 'os', 'oa', 'os', 'only'],
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
    .option('debug', {
      alias: 'd',
      default: false,
      type: 'boolean',
      description: 'Run with debug output'
    })
    
    .argv;
    
    //-----------
    
    var { var2Lower,var2Cap, prefix, onlyselected, fileout, debug, verbose,all,jsonx,exportprefix } = argv;
    






//Possible later support for .env preconf 
try {
  var tst = require('dotenv').config()
  if (tst.parsed) {
    config = new Object()
    var { json2bashtofile, json2bashtofilepath } = tst.parsed;
  }
} catch (error) { }












if (argv.jsonFile != "-")
  try {
    var filein = argv.jsonFile //argv._[0];
    let rawdata = fs.readFileSync(filein);
    main(rawdata);

  } catch (error) {
    console.log("Error reading input file.")
    console.log(error)
  }
else try {
  //read STDIn

  const stdin = process.stdin;
  let rawdata = '';

  stdin.setEncoding('utf8');

  stdin.on('data', function (chunk) {
    rawdata += chunk;
  });
  var c = 0;
  stdin.on('end', function () {
    //  console.log(c,":Hello " + rawdata);
    main(rawdata);
    c++;
  });

  stdin.on('error', console.error);

} catch (error) {

}

function main(rawdata) {
  var data = JSON.parse(rawdata);
  var h= getCSVHeader(data);
  console.log(h);
  
}

function getCSVHeader(data) {
  var h="";
  var once = false;
  for (const [key, value] of Object.entries(data)) {
    //console.log(`${key}: ${value.oid}`);
    var max = 0;
    for (const [key2, value2] of Object.entries(value)) {
      max++;
    }
    var c = 0;
    for (const [key2, value2] of Object.entries(value)) {
      if (key == 1) {
        //console.log(`${key2}`);
        var _l = "";
        if (c < max - 1)
          _l = ",";
        h += key2 + _l;
        once = true;
      }
      c++;
    }
  }
  return  h;
}
