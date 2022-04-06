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

//console.log(process.argv)

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

argv =
yargs(hideBin(process.argv))

    .scriptName("json2bash")
    // .usage(appStartMessage + helpExample)
    .usage('$0 <jsonFile> [objCsvArray] [fileout]', "run the thing", (yargs) => {
      yargs.positional('jsonFile', {
        describe: 'json File input',
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
    })
    .epilogue('for more information, find our manual at https://github.com/GuillaumeIsabelle/json2bashenv#readme')
    
    .option('var2Lower', {
      default: false,
      type: 'boolean',
      alias: ['tolower', 'tl', 'toLowerCase', 't', 'lc'],
      description: 'Changes env name to lowercase'
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
    .example("json2bash sample.json --tolower", "simple output")
    .example("json2bash sample.json . outfile.env --tolower", "simple output to file (the dot signify we keep top level element)")
    .example("json2bash samplelevel.json \"result\" --tolower", "extract the tag result")
    .example("json2bash samplelevel.json \"result\" --tolower --oa --prefix", "extract the tag result only (no top level prop will output)")
    .example("json2bash samplelevel.json \"result,stuff\" --tolower --prefix", "Extract the result and stuff object to lowercase and add their object name as prefix to variable")
    .argv;
    
    //-----------
    
    var { var2Lower, prefix, onlyselected, fileout, debug, verbose,all } = argv;
    var d = debug;

    if (verbose)console.log(pipeMode?"Pipe mode active": "Normal mode");
    
    //var fileout = argv.fileout? argv.fileout: null;
    var noFileOut = fileout == null;
    if (d) console.log(fileout, noFileOut);
var config = null;





if (d) console.log(argv);

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

  try {
    
    
    let jsonObject = JSON.parse(rawdata);

    //l
    var level = argv.objCsvArray;
    console.log(level);
    var l = [];
    if (level == "." && all ){
        if (d)console.log("DO BUILD THE ARRAY RECURSIVE READ THE OBJECTS");
        level = getObjArray(jsonObject);
      }
      if (level)
      l = level.split(",");

      d=true;
   if (d) console.log("level:",level);
   if (d) console.log("l:",l);
   d=false;
 //exit();


    if (d) console.log(jsonObject.PublicIp)

    var out = [];
    var c = 0;
    Object.entries(jsonObject).forEach(entry => {
      const [key, value] = entry;
      var outKey = key;
      if (var2Lower) outKey = key.toLowerCase();


      var t = typeof (value);
      if (d) console.log(t);

      if (d) console.log(l);
      // console.log(level);
      // exit();

      if (t != "object") {
        if (d) console.log(key.trim(), "=", value.trim());

        if (!onlyselected)
          out[c] = "export " + outKey + "=\"" + value.trim() + "\"";
      }
      else {
        if (d) console.log("Special parsing, we have an objcet")
        l.forEach(kl => {
          //console.log(kl);
          if (key == kl || all) {
            if (d) console.log(key, ":", kl);
            var prefixKey = kl;
            if (kl==".")prefixKey = key;

            var o = parseObject2Bash(value, prefixKey, noFileOut,all);
            if (o) {
              if (verbose) console.log("Fileout activated")
              o.forEach(oelem => {
                out[c] = oelem;
                c++;
              });
            }
          }
        });

      }
      c++;
    });
    if (d) console.log("-------------")
    if (d) console.log(out)

    var content = "";
    out.forEach(element => {
      //            Output to console 
      if (noFileOut)
        console.log(element)
      //            or create a content to write to file
      else content += element + "\n";
    });

    if (!noFileOut) {
      console.log("Writting file:", fileout);
      try {
        fs.writeFileSync(fileout, content);
        //file written successfully
      } catch (err) {
        console.log("Error writing file:", fileout);
        console.error(err)
      }

    }


  } catch (error) {
    console.log("Must specify a file as first args")
    console.log(error)

  }

}




/**
 *  Parse object 2 bash function
 * 
 * @param {*} jsonObject 
 * @param {*} oLevelName 
 * @param {*} outputToStdOut 
 * @returns 
 */
function parseObject2Bash(jsonObject, oLevelName = "", outputToStdOut = false,outputAll=false,oLevelNameOVerride="") {

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
    if (prefix && oLevelNameOVerride != "") prefixVal = oLevelNameOVerride;

    var envKeyName = prefixVal + outKey;

    //value to output
    if (t != "object") {
      var v = "" + value;

      out[i] = "export "
        + envKeyName
        + "=\""
        + v.replace(/(?:\r\n|\r|\n)/g, '\\n') + "\"";
    }
    else {
      //We have an object
      console.log("value:",value," outKey:",outKey," keyname:",envKeyName);
      if(outputAll)
      {
        var o2 = parseObject2Bash(value,outKey,outputToStdOut,outputAll,envKeyName);
        
        //add result to output
       // console.log("o2:",o2);
        if (o2)
        o2.forEach(e2 => {
          out[i] = e2;
          i++;
        });
      }
    }

    i++;
  });
  if (outputToStdOut)
    out.forEach(element => {
      console.log(element)
    });
  else
    return out;
}


function getObjArray(jsonObject)
{
  var i = 0, ii=0;
  var r = "";
  var o = [];
  Object.entries(jsonObject).forEach(entry => {
    const [key, value] = entry;   
    
    var t = typeof (value);  
    
    //value to output
    if (t == "object") {
      o[ii] = key;
      ii++;

     if (d) console.log("k:",key);
     // var addon = key + ",";
     // r = r+ addon;
    }
    
    i++;
  });
  if (d)console.log("Made array for --all:",o);
  i=0;
  o.forEach(element => {
    //const [key, value] = element;   
    
    var addon = element ;
    if (i < o.length-1)
       addon = element+ ",";
    r = r+ addon;
    i++;
  });
  if (d) console.log("Made string:",r);
  return r;
}