#!/bin/bash

OUTPUT=http-parser.js
EXPORTED_FUNCTIONS="['_create_parser', '_get_settings', '_http_parser_execute', '_get_error_name', '_get_error_description', '_http_should_keep_alive', '_get_http_major', '_get_http_minor', '_get_status_code', '_get_method', '_get_upgrade']"
PARSER_DIR="dep/http-parser"
OPTIMIZATION="O1"

../emscripten/emcc $PARSER_DIR/http_parser.c ./wrapper.c -I$PARSER_DIR -s EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS" -$OPTIMIZATION -o parser.js

insert_line=$(grep -n '{parser.js}' ./wrapper.js | sed 's|:.*||g')

head -n $insert_line ./wrapper.js >$OUTPUT
cat parser.js >>$OUTPUT
tail -n +$insert_line ./wrapper.js >>$OUTPUT
