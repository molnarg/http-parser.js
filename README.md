http-parser.js
==============

This is a JavaScript port of the HTTP parser used in node.js
([joyent/http-parser](https://github.com/joyent/http-parser)).

The C source code is compiled using the great [emscripten](https://github.com/kripken/emscripten)
compiler, and is wrapped in a convenient API that is similar to the node.js binding to the library
(`process.binding('http_parser').HTTPParser`).

The module can be used in the browser (with or without an AMD module loader) and in node as well.

License
=======

The MIT License

Copyright (C) 2013 Gábor Molnár <gabor.molnar@sch.bme.hu>

