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
jsonarr2csv
By Guillaume Descoteaux-Isabelle, 2022 
----------------------------------------`;
// const { exit } = require("node-process");
const helpExample = `  `;
var author = "Guillaume Descoteaux-Isabelle";




argv =
yargs(hideBin(process.argv))
    .scriptName("jsonarr2csv")
    // .usage(appStartMessage + helpExample)
    .usage('$0 <jsonFile> [idxname] [fileout]', "by " + author + ", 2022", (yargs) => {
      yargs.positional('jsonFile', {
        describe: 'json File input (optional when receiving using pipe)',
        type: 'string',
        default: '-'
      }),
      yargs.positional('idxname', {
        describe: 'index name in the file as csv',
        type: 'string',
        default: 'null'
      }),
      yargs.positional('fileout', {
        describe: 'env file output',
        type: 'string',
        default: null
      })
    .example("jsonarr2csv sample.json", "simple output to console")
    .example("jsonarr2csv sample.json > outfile.csv", "simple output to file ")
    .example("jsonarr2csv sample.json myindex > outfile.csv", "simple output to file renaming idx")
    .epilogue('for more information, find our manual at https://github.com/GuillaumeIsabelle/jsonarr2csvenv#readme')
    .help()
    })    
    .option('numberedindex', {
      alias: 'n',
      default: false,
      type: 'boolean',
      description: 'add index column numbered'
    })
    .option('matchobj', {
      alias: 'm',
      default: true,
      type: 'boolean',
      description: 'insure matching fields using first object of array/object'
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
    
var { idxname,numberedindex, fileout, debug, verbose,matchobj } = argv;
    
if (idxname != "null") numberedindex = true;
if (numberedindex==true && idxname=="null")idxname = "idx";





//Possible later support for .env preconf 
try {
  var tst = require('dotenv').config()
  if (tst.parsed) {
    config = new Object()
    var { jsonarr2csvtofile, jsonarr2csvtofilepath } = tst.parsed;
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
  //var h= getCSVHeader(data);
  //console.log(h);
 // var csvLines = getCSVLines(data);
  var csvLines ="";
  if (matchobj)csvLines= getCSVLinesPTO(data);
  else csvLines = getCSVLinesPTOv1(data);
  console.log(csvLines);
}

function getPropFromVarious(data){
  var once = false;
  var r = [];
  var c = 0;
  for (const [key, value] of Object.entries(data)) {
    //console.log(`${key}: ${value.oid}`);
    var max = 0;
    for (const [key2, value2] of Object.entries(value)) {
      r[key2] = "1";
      max++;
    }
    if (c> 100)     once = true;
    c++;
    if (!once) break;
  }
  // var p = [];
  // for (const [key, value] of Object.entries(r)) {

  // }
  return r;
}

function getEntriesAsHeaderCSV(rData)
{
  var h=""; var max = 0;
  for (const [key2, value2] of Object.entries(rData)) {
    max++;
  }
  var c=0;
  for (const [pk, pv] of Object.entries(rData)) {   
    var _s = "";
    if (c < max - 1)
      _s = ",";
    h += pk + _s;
    c++;
   }
   return h;
}

function createObjectFilled(rData,_defaultValue=null)
{
  var r= new Object();
  for (const [key, value] of Object.entries(rData)) {
    r[key]= _defaultValue;
  }
  return r;
}


function getCSVLinesPTO(data) {
  var h="";
  var ls="";
  var once = false;
  var r =new Object();
  r= getPropFromVarious(data);
  h= getEntriesAsHeaderCSV(r);
  //console.log(h) 
  var o2 = new Object();
  var cl = 0;
  o2= createObjectFilled(r);
  for (const [pk, pv] of Object.entries(o2)) { cl++; } 
  //console.log(cl);
  //console.log(o2);
  //return;
  //return;
  for (const [key, value] of Object.entries(data)) {
    
    var _prestringIndex = key + ",";
    if (!numberedindex) _prestringIndex = "";
    ls += _prestringIndex;
    
    var o = new Object();
    o = createObjectFilled(r);
    var c = 0;
    var criss = "";
    for (const [pk, pv] of Object.entries(o)) {

      if(value.hasOwnProperty(pk))  
      {
        o[pk] = value[pk];
      }  
      //else  console.log("null data for prop:" + pk);

     // criss += o[pk]+  ","
      
      var _s = "\n";
      if (c < cl - 1)     _s = ",";
      ls += o[pk] + _s;
      
      c++;
    }
   // console.log(criss);

    
    
    //ls += "\n";
    //if (key>1) break;
  }
  //  return;

  var _prestring = idxname + ",";
  if (!numberedindex) _prestring = "";
  return  _prestring+     h + "\n" + ls;
}

function getCSVLinesPTOv1(data) {
  var h="";
  var ls="";
  var once = false;
  for (const [key, value] of Object.entries(data)) {
    //console.log(`${key}: ${value.oid}`);
    var max = 0;
    for (const [key2, value2] of Object.entries(value)) {
      max++;
    }
    var c = 0;
    var _prestringIndex = key + ",";
    if (!numberedindex) _prestringIndex = "";
    ls += _prestringIndex;

    for (const [key2, value2] of Object.entries(value)) {
      if (key == 1) {
        //console.log(`${key2}`);
        var _s = "";
        if (c < max - 1)
          _s = ",";
        h += key2 + _s;
        once = true;
      }    
      var _s = "\n";
      if (c < max - 1)
        _s = ",";
      ls += value2 + _s;
      once = true;
  
      c++;
    }
    //ls += "\n";
    //if (key>1) break;
  }
  var _prestring = idxname + ",";
  if (!numberedindex) _prestring = "";
  return  _prestring+  h + "\n" + ls;
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
    if (key>1) break;
  }
  return  h;
}
