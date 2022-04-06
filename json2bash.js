#!/usr/bin/env node
'use strict';


var path = require('path');

const fs = require('fs');


var args = process.argv.slice(2);


//----for later

// const yargs = require('yargs');
// var ver = yargs.version();

// var appStartMessage = 
// `Multi platform Contact Sheet maker
// By Guillaume Descoteaux-Isabelle, 2020-2021
// version ${ver}
// ----------------------------------------`;
// //const { argv } = require('process');
// //const { hideBin } = require('yargs/helpers')
// const argv = yargs(process.argv)

// .scriptName("gis-csm")
// .usage(appStartMessage)
//     // .command('serve [port]', 'start the server', (yargs) => {
//     //   yargs
//     //     .positional('f', {
//     //       describe: 'port to bind on',
//     //       type:'string',
//     //       default: 5000
//     //     })
//     // }, (argv) => {
//     //   if (argv.verbose) console.info(`start server on :${argv.port}`)
//     //   //serve(argv.port)
//     //   console.log("test");
//     //   console.info(`start server on :${argv.port}`)
//     // })
//     .option('file', {
//       alias: 'f',
//       type: 'string',
//       description: 'Specify the file out'
//     })
//     .option('directory', {
//       alias: 'd',
//       type: 'boolean',
//       default:false,
//       description: 'Name the output using current Basedirname'
//     }).usage(`gis-csm -d --label  # Assuming this file in directory: vm_s01-v01_768x___285k.jpg
//     # will extract 285 and add that instead of filename`)
//     .option('verbose', {
//       alias: 'v',
//       default:false,
//       type: 'boolean',
//       description: 'Run with verbose logging'
//     })
//     .option('label', {
//       alias: 'l',
//       type: 'boolean',
//       default:false,
//       description: 'Label using last digit in filename (used for parsing inference result that contain checkpoint number)'
//     })
//   .argv;


//-----------

var config = null;

const envListHelp = `
`;

if (!args || args.length == 0  ||args[0] == "--help")
{
  console.log(`
  HELP
  json2bash myfile.json [--toLower]
  --tolower = variable name
  
  `);
}
else  
{

  try {
    
  var tst = require('dotenv').config()
  if (tst.parsed) {
    config = new Object()
    var { json2bashtofile,json2bashtofilepath } = tst.parsed;
    
    
  }
  
  
} catch (error) { }

var var2Lower = false;

try {
  
  var filein = args[0];
  if (args[1]) {
    var tst = args[1];
    if (tst.toLowerCase() =="--tolower") var2Lower=true;
    if (tst.toLowerCase() =="--tolowercase") var2Lower=true;
    if (tst =="--2lower") var2Lower=true;
    if (tst =="--2lc") var2Lower=true;
    if (tst =="-l") var2Lower=true;
    if (tst =="--l") var2Lower=true;
  }  
  
  let rawdata = fs.readFileSync(filein);
  let jsonObject = JSON.parse(rawdata);
  var d = false;

  if (d)  console.log(jsonObject.PublicIp)
  var out = [];
  var c = 0;
  Object.entries(jsonObject).forEach(entry => {
    const [key, value] = entry;
  if (d)  console.log(key.trim(),"=", value.trim());
    var outKey = key;
     if (var2Lower) outKey = key.toLowerCase();

    out[c] = "export " + outKey + "=\""+ value.trim()+ "\"";
    c++;
  });
  if (d)  console.log("-------------")
 if (d)   console.log(out)
  out.forEach(element => {
    console.log(element)
  });
  
  
} catch (error) {
  console.log("Must specify a file as first args")
  console.log(error)
  
}



}