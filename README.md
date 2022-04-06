# json2bashenv
json2bashenv


## Install

```sh
npm install json2bash --g
```

## Usage

```sh
json2bash sample.json
json2bash sample.json --tolower
json2bash samplelevel.json --tolower      
#simple output

#extract the tag result
json2bash samplelevel.json "result"       
--tolower

#extract the tag result only 
#(no top level prop will output)
json2bash samplelevel.json "result"  --tolower --oa --prefix                   

#Extract the result and stuff object
#to lowercase and add their object name as prefix to variable
json2bash samplelevel.json "result,stuff" --tolower --prefix         
```


## Complex Usage: 

```sh
#Complex pipe extracting an object then one of its subobject pipe back to be extracted

./json2bash samplesublevelon  \"result\" -p;./json2bash samplesublevelon  \"result\" -p -j |./json2bash \"meta\" -p -l -o
```