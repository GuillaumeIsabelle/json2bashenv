#!/usr/bin/env node
'use strict';

const stdin = process.stdin;
let rawdata = '';

stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
  rawdata += chunk;
});
var c=0;
stdin.on('end', function () {
  console.log(c,":Hello " + rawdata);
  c++;
});

stdin.on('error', console.error);
