#!/usr/bin/env bash

#   an example of a bash script that wants access to package.json

eval "$(./getenv)"

echo "Hi. I'm gonna output some environment vars prefixed with FOO_"

env | grep FOO
