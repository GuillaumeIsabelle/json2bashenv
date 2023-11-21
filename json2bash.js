#!/usr/bin/env node
'use strict';


var path = require('path');

const fs = require('fs');

// console.log("argv 0,1,2:"+ process.argv[0] + " " + process.argv[1] + " " + process.argv[2]);

var args = process.argv.slice(2);



//Backward compatibility
var tmpinputfile = args[0];

var tmpoutfile = args[2] && path.extname(args[2]) === '.sh' ? args[2] : null;

if (tmpoutfile == null) tmpoutfile = args[1] && path.extname(args[1]) === '.csv' ? args[1] : null;




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


var appStartMessage = `-------------------------
json2bash
By Guillaume Descoteaux-Isabelle, 2023 
----------------------------------------`;
// const { exit } = require("node-process");
const helpExample = `  `;
var author = "Guillaume Descoteaux-Isabelle";
argv =
yargs(hideBin(process.argv))
    .scriptName("json2bash")
    // .usage(appStartMessage + helpExample)
    .command('$0', "by " + author + ", 2023", (yargs) => {
      yargs
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
      
    .option('jsonfile', {default: "__pipe__", type: 'string', description: 'json File input (optional when receiving using pipe)', alias: ['f', 'file']})
    .option('objCsvArray', {default: ".", type: 'string', description: 'object to extract in the file as csv', alias: ['obj']})
    .option('fileout', {default: null, type: 'string', description: 'env file output', alias: ['out']}) 
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

if (fileout == null && tmpoutfile != null) fileout = tmpoutfile; 



//var CASE output
if (var2Lower && var2Cap) {console.error("Cant't use both low and cap option"); exit(2);}
var varCase = "ori";
if (var2Lower) varCase = "low";
else if (var2Cap) varCase = "cap";


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



if ((argv.jsonfile != "-" && argv.jsonfile != "__pipe__") || 
  (fs.existsSync(argv.jsonfile) || fs.existsSync(tmpinputfile)) )
  {
  if ( fs.existsSync(tmpinputfile)) {argv.jsonfile = tmpinputfile;}
  try {
    
    var filein = argv.jsonfile //argv._[0];
    let rawdata = fs.readFileSync(filein,'utf-8');

    if (typeof rawdata !== 'string') {
      console.error('Error: read data is not text.');
    } else {
      main(rawdata);
    }

  } catch (error) {
    console.log("Error reading input file.")
    console.log(error)
  }}
else try {
  //read STDIn

  process.stdin.setEncoding('utf8');

  let inputData = '';

  process.stdin.on('readable', () => {
    let chunk;
    // Use a loop to make sure we read all available data.
    while ((chunk = process.stdin.read()) !== null) {
      inputData += chunk;
    }
  });

  process.stdin.on('end', () => {
    // Here, all of the data has been read.
    //console.log(`Received data: ${inputData}`);
    main(inputData);
  });

  stdin.on('error', console.error);

} catch (error) {

}

function main(rawdata) {

  try {

    if (all) {
      if (fileout==null && argv.objCsvArray != ".") fileout= argv.objCsvArray;

      //var jsonStringyfied = JSON.stringify(rawdata);
      var content = code_monk__json2bashV2Content(rawdata,prefix,varCase,fileout==null);
      writeMainResults(content) ;
    }
    else {

      var level = "";
      
      let jsonObject = JSON.parse(rawdata);
      
      // if (argv._[1]) level = argv._[1];
      if (argv.objCsvArray) level = argv.objCsvArray;
      var l = level.split(",");
      
      if (d) console.log(l);
      
      if (jsonx)
      {
        var o =new Object(); 
        var i = 0;
        l.forEach(el => {
          
          Object.entries(jsonObject).forEach(entry => {
            const [key, value] = entry;
            if (el == key)
            {
              //output json
              var json = JSON.stringify(value);
              console.log(json);
              o[key] =value; 
              i++;
            }
          });
        });
        // var json = JSON.stringify(o);
        // console.log(json);
        exit();
      }
      
      
      if (d) console.log(jsonObject.PublicIp)
      
      var out = [];
      var c = 0;
      Object.entries(jsonObject).forEach(entry => {
        const [key, value] = entry;
        var outKey = key;
        if (var2Lower) outKey = key.toLowerCase();
        
        
        var t = typeof (value);
        if (d) console.log(t);
        
        // console.log(level);
        // exit();
        
        if (t != "object") {
          if (d) console.log(key.trim(), "=", value.trim());
          
          var exportprefixVal = "";
          if (exportprefix) exportprefixVal = "export ";
          
          if (!onlyselected)
          out[c] = exportprefixVal + outKey + "=\"" + value.trim() + "\"";
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
        writeMainResults(content);
        
        
      }
  }
    
    
  } catch (error) {
    console.log("Must specify a file as first args")
    console.log(error)
    
  }
  
}




function writeMainResults(content) {
  try {
    if (fileout != null) 
      fs.writeFileSync(fileout, content);
    else 
      console.log(content);
    //file written successfully
  } catch (err) {
    console.log("Error writing file:", fileout);
    console.error(err)
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
function parseObject2Bash(jsonObject, oLevelName = "", outputToStdOut = false,outputAll=false) {

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
      if(outputAll)
      {
        var o2 = parseObject2Bash(value,envKeyName,outputToStdOut,outputAll);
        
        //add result to output
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
  
  Object.entries(jsonObject).forEach(entry => {
    const [key, value] = entry;


    var t = typeof (value);  
    var r = "";

    //value to output
    if (t == "object") {
      r+= key
    }
    
    i++;
  });
}




/**
 * code_monk__json2bashV2
 * 
 * @param {*} jsonpath 
 * @param {*} outprefix 
 * @param {*} varcase 
 * @param {*} printstdout 
 * @returns 
 */
function code_monk__json2bashV2(jsonpath, outprefix = "", varcase="original",printstdout=true) {
  const _json = require(jsonpath);
  return code_monk__json2bashV2Content(_json,outprefix,varcase,printstdout);
}

/**
 * code_monk__json2bashV2Content
 * 
 * @param {*} jsondata 
 * @param {*} outprefix 
 * @param {*} varcase 
 * @param {*} printstdout 
 * @returns 
 */
function code_monk__json2bashV2Content(jsondata, outprefix = "", varcase="original",printstdout=true) {

  let jsonObject = jsondata;
 // let jsonStringyfied = jsondata;
  try { //try to convert raw data, otherwise all is fine    
    jsonObject = JSON.parse(jsondata);
    //jsonStringyfied = JSON.stringify(jsonObject);
  } catch (error) {  }
 //console.log(jsonObject);
	const _json2bash = require('./repo_code_monk/index');
	
  
  const options ={
    quote_character: "\'",
    omit_variable_names_beginning_with_underscore: true,
    disallow_two_underscores_in_a_row: true,
    replace_illegal_chars_with: '',
    arrays_become: String,
    posix_mode: false, 
    quote_character: "\'",
    varcase: varcase 
  };
	var _r = _json2bash(jsonObject, outprefix,options);
	var _txt = 	_r.export();
  if (printstdout)
	console.log(_txt	);
  return _txt;
}
