(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory()
  } else if (typeof define === 'function' && define.amd) {
    define(factory)
  } else {
    root.HTTPParser = factory()
  }
}(this, function () {

  // Here comes the compiled http-parser.c and wrapper.c
  // {parser.js}
// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function(filename) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename).toString();
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename).toString();
    }
    return ret;
  };

  Module['load'] = function(f) {
    globalEval(read(f));
  };

  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}

if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  // Polyfill over SpiderMonkey/V8 differences
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function(f) { snarf(f) };
  }

  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}

if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }

  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}

if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}

if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  Module['load'] = importScripts;
}

if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];

  
// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  BITSHIFT64_SHL: 0,
  BITSHIFT64_ASHR: 1,
  BITSHIFT64_LSHR: 2,
  bitshift64: function (low, high, op, bits) {
    var ret;
    var ander = Math.pow(2, bits)-1;
    if (bits < 32) {
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [low << bits, (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits))];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [(((low >>> bits ) | ((high&ander) << (32 - bits))) >> 0) >>> 0, (high >> bits) >>> 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [((low >>> bits) | ((high&ander) << (32 - bits))) >>> 0, high >>> bits];
          break;
      }
    } else if (bits == 32) {
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [0, low];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [high, (high|0) < 0 ? ander : 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [high, 0];
          break;
      }
    } else { // bits > 32
      switch (op) {
        case Runtime.BITSHIFT64_SHL:
          ret = [0, low << (bits - 32)];
          break;
        case Runtime.BITSHIFT64_ASHR:
          ret = [(high >> (bits - 32)) >>> 0, (high|0) < 0 ? ander : 0];
          break;
        case Runtime.BITSHIFT64_LSHR:
          ret = [high >>>  (bits - 32) , 0];
          break;
      }
    }
    HEAP32[tempDoublePtr>>2] = ret[0]; // cannot use utility functions since we are in runtime itself
    HEAP32[tempDoublePtr+4>>2] = ret[1];
  },
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func, sig) {
    assert(sig);
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function stackAlloc(size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2); return ret; },
  staticAlloc: function staticAlloc(size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function alignMemory(size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function makeBigInt(low,high,unsigned) { var ret = (unsigned ? (((low)>>>0)+(((high)>>>0)*4294967296)) : (((low)>>>0)+(((high)|0)*4294967296))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}




var CorrectionsMonitor = {
  MAX_ALLOWED: 0, // XXX
  corrections: 0,
  sigs: {},

  note: function(type, succeed, sig) {
    if (!succeed) {
      this.corrections++;
      if (this.corrections >= this.MAX_ALLOWED) abort('\n\nToo many corrections!');
    }
  },

  print: function() {
  }
};





//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

var ABORT = false;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = eval('_' + ident);
  } catch(e) {
    try {
      func = globalScope['Module']['_' + ident]; // closure exported function
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((ptr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]); break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_NONE = 3; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// Simple unoptimized memset - necessary during startup
var _memset = function(ptr, value, num) {
  var stop = ptr + num;
  while (ptr < stop) {
    HEAP8[(ptr++)]=value;
  }
}

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    _memset(ret, 0, size);
    return ret;
  }

  if (singleType === 'i8') {
    HEAPU8.set(new Uint8Array(slab), ret);
    return ret;
  }

  var i = 0, type;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);
    i += Runtime.getNativeTypeSize(type);
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  var utf8 = new Runtime.UTF8Processor();
  var nullTerminated = typeof(length) == "undefined";
  var ret = "";
  var i = 0;
  var t;
  while (1) {
    t = HEAPU8[((ptr)+(i))];
    if (nullTerminated && t == 0) break;
    ret += utf8.processCChar(t);
    i += 1;
    if (!nullTerminated && i == length) break;
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

function Array_stringify(array) {
  var ret = "";
  for (var i = 0; i < array.length; i++) {
    ret += String.fromCharCode(array[i]);
  }
  return ret;
}
Module['Array_stringify'] = Array_stringify;

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
  assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
         'Cannot fallback to non-typed array case: Code is too specialized');

  var buffer = new ArrayBuffer(TOTAL_MEMORY);
  HEAP8 = new Int8Array(buffer);
  HEAP16 = new Int16Array(buffer);
  HEAP32 = new Int32Array(buffer);
  HEAPU8 = new Uint8Array(buffer);
  HEAPU16 = new Uint16Array(buffer);
  HEAPU32 = new Uint32Array(buffer);
  HEAPF32 = new Float32Array(buffer);
  HEAPF64 = new Float64Array(buffer);

  // Endianness check (note: assumes compiler arch was little-endian)
  HEAP32[0] = 255;
  assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max

var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code is increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}

STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY

var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown

function initRuntime() {
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);

  // Print summary of correction activity
  CorrectionsMonitor.print();
}

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[((buffer)+(i))]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[((buffer)+(i))]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
  // TODO: clean up previous line
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

// === Body ===



assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);

STATICTOP += 3780;

assert(STATICTOP < TOTAL_MEMORY);






















































































































allocate([255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,3,4,5,6,7,8,9,255,255,255,255,255,255,255,10,11,12,13,14,15,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,10,11,12,13,14,15,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] /* \FF\FF\FF\FF\FF\FF\F */, "i8", ALLOC_NONE, 5242880);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,35,36,37,38,39,0,0,42,43,0,45,46,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,0,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,0,0,0,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,0,124,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] /* \00\00\00\00\00\00\0 */, "i8", ALLOC_NONE, 5243136);
allocate([16,0,0,0,6,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,12,0,0,0,8,0,0,0,14,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 5243392);
allocate([0,0,0,0,246,255,255,127,255,255,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] /* \00\00\00\00\F6\FF\F */, "i8", ALLOC_NONE, 5243424);
allocate(24, "i8", ALLOC_NONE, 5243456);
allocate(104, "i8", ALLOC_NONE, 5243480);
allocate(240, "i8", ALLOC_NONE, 5243584);
allocate([77,75,65,67,84,73,86,73,84,89,0] /* MKACTIVITY\00 */, "i8", ALLOC_NONE, 5243824);
allocate([82,69,80,79,82,84,0] /* REPORT\00 */, "i8", ALLOC_NONE, 5243836);
allocate([85,78,76,79,67,75,0] /* UNLOCK\00 */, "i8", ALLOC_NONE, 5243844);
allocate([83,69,65,82,67,72,0] /* SEARCH\00 */, "i8", ALLOC_NONE, 5243852);
allocate([80,82,79,80,80,65,84,67,72,0] /* PROPPATCH\00 */, "i8", ALLOC_NONE, 5243860);
allocate([80,82,79,80,70,73,78,68,0] /* PROPFIND\00 */, "i8", ALLOC_NONE, 5243872);
allocate([77,79,86,69,0] /* MOVE\00 */, "i8", ALLOC_NONE, 5243884);
allocate([77,75,67,79,76,0] /* MKCOL\00 */, "i8", ALLOC_NONE, 5243892);
allocate([76,79,67,75,0] /* LOCK\00 */, "i8", ALLOC_NONE, 5243900);
allocate([67,79,80,89,0] /* COPY\00 */, "i8", ALLOC_NONE, 5243908);
allocate([99,104,117,110,107,101,100,0] /* chunked\00 */, "i8", ALLOC_NONE, 5243916);
allocate([84,82,65,67,69,0] /* TRACE\00 */, "i8", ALLOC_NONE, 5243924);
allocate([79,80,84,73,79,78,83,0] /* OPTIONS\00 */, "i8", ALLOC_NONE, 5243932);
allocate([67,79,78,78,69,67,84,0] /* CONNECT\00 */, "i8", ALLOC_NONE, 5243940);
allocate([80,85,84,0] /* PUT\00 */, "i8", ALLOC_NONE, 5243948);
allocate([80,79,83,84,0] /* POST\00 */, "i8", ALLOC_NONE, 5243952);
allocate([72,69,65,68,0] /* HEAD\00 */, "i8", ALLOC_NONE, 5243960);
allocate([71,69,84,0] /* GET\00 */, "i8", ALLOC_NONE, 5243968);
allocate([68,69,76,69,84,69,0] /* DELETE\00 */, "i8", ALLOC_NONE, 5243972);
allocate([97,110,32,117,110,107,110,111,119,110,32,101,114,114,111,114,32,111,99,99,117,114,114,101,100,0] /* an unknown error occ */, "i8", ALLOC_NONE, 5243980);
allocate([72,80,69,95,85,78,75,78,79,87,78,0] /* HPE_UNKNOWN\00 */, "i8", ALLOC_NONE, 5244008);
allocate([48,32,38,38,32,34,83,104,111,117,108,100,110,39,116,32,103,101,116,32,104,101,114,101,46,34,0] /* 0 && \22Shouldn't ge */, "i8", ALLOC_NONE, 5244020);
allocate([112,97,114,115,101,114,32,105,115,32,112,97,117,115,101,100,0] /* parser is paused\00 */, "i8", ALLOC_NONE, 5244048);
allocate([72,80,69,95,80,65,85,83,69,68,0] /* HPE_PAUSED\00 */, "i8", ALLOC_NONE, 5244068);
allocate([115,116,114,105,99,116,32,109,111,100,101,32,97,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,0] /* strict mode assertio */, "i8", ALLOC_NONE, 5244080);
allocate([72,80,69,95,83,84,82,73,67,84,0] /* HPE_STRICT\00 */, "i8", ALLOC_NONE, 5244112);
allocate([101,110,99,111,117,110,116,101,114,101,100,32,117,110,101,120,112,101,99,116,101,100,32,105,110,116,101,114,110,97,108,32,115,116,97,116,101,0] /* encountered unexpect */, "i8", ALLOC_NONE, 5244124);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,73,78,84,69,82,78,65,76,95,83,84,65,84,69,0] /* HPE_INVALID_INTERNAL */, "i8", ALLOC_NONE, 5244164);
allocate([105,110,118,97,108,105,100,32,99,111,110,115,116,97,110,116,32,115,116,114,105,110,103,0] /* invalid constant str */, "i8", ALLOC_NONE, 5244192);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,67,79,78,83,84,65,78,84,0] /* HPE_INVALID_CONSTANT */, "i8", ALLOC_NONE, 5244216);
allocate([105,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,99,104,117,110,107,32,115,105,122,101,32,104,101,97,100,101,114,0] /* invalid character in */, "i8", ALLOC_NONE, 5244240);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,67,72,85,78,75,95,83,73,90,69,0] /* HPE_INVALID_CHUNK_SI */, "i8", ALLOC_NONE, 5244280);
allocate([48,32,38,38,32,34,85,110,107,110,111,119,110,32,104,101,97,100,101,114,95,115,116,97,116,101,34,0] /* 0 && \22Unknown head */, "i8", ALLOC_NONE, 5244304);
allocate([105,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,99,111,110,116,101,110,116,45,108,101,110,103,116,104,32,104,101,97,100,101,114,0] /* invalid character in */, "i8", ALLOC_NONE, 5244332);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,67,79,78,84,69,78,84,95,76,69,78,71,84,72,0] /* HPE_INVALID_CONTENT_ */, "i8", ALLOC_NONE, 5244376);
allocate([105,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,104,101,97,100,101,114,0] /* invalid character in */, "i8", ALLOC_NONE, 5244404);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,72,69,65,68,69,82,95,84,79,75,69,78,0] /* HPE_INVALID_HEADER_T */, "i8", ALLOC_NONE, 5244432);
allocate([76,70,32,99,104,97,114,97,99,116,101,114,32,101,120,112,101,99,116,101,100,0] /* LF character expecte */, "i8", ALLOC_NONE, 5244460);
allocate([72,80,69,95,76,70,95,69,88,80,69,67,84,69,68,0] /* HPE_LF_EXPECTED\00 */, "i8", ALLOC_NONE, 5244484);
allocate([105,110,118,97,108,105,100,32,102,114,97,103,109,101,110,116,0] /* invalid fragment\00 */, "i8", ALLOC_NONE, 5244500);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,70,82,65,71,77,69,78,84,0] /* HPE_INVALID_FRAGMENT */, "i8", ALLOC_NONE, 5244520);
allocate([105,110,118,97,108,105,100,32,113,117,101,114,121,32,115,116,114,105,110,103,0] /* invalid query string */, "i8", ALLOC_NONE, 5244544);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,81,85,69,82,89,95,83,84,82,73,78,71,0] /* HPE_INVALID_QUERY_ST */, "i8", ALLOC_NONE, 5244568);
allocate([117,112,103,114,97,100,101,0] /* upgrade\00 */, "i8", ALLOC_NONE, 5244596);
allocate([105,110,118,97,108,105,100,32,112,97,116,104,0] /* invalid path\00 */, "i8", ALLOC_NONE, 5244604);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,80,65,84,72,0] /* HPE_INVALID_PATH\00 */, "i8", ALLOC_NONE, 5244620);
allocate([105,110,118,97,108,105,100,32,112,111,114,116,0] /* invalid port\00 */, "i8", ALLOC_NONE, 5244640);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,80,79,82,84,0] /* HPE_INVALID_PORT\00 */, "i8", ALLOC_NONE, 5244656);
allocate([105,110,118,97,108,105,100,32,104,111,115,116,0] /* invalid host\00 */, "i8", ALLOC_NONE, 5244676);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,72,79,83,84,0] /* HPE_INVALID_HOST\00 */, "i8", ALLOC_NONE, 5244692);
allocate([105,110,118,97,108,105,100,32,85,82,76,0] /* invalid URL\00 */, "i8", ALLOC_NONE, 5244712);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,85,82,76,0] /* HPE_INVALID_URL\00 */, "i8", ALLOC_NONE, 5244724);
allocate([105,110,118,97,108,105,100,32,72,84,84,80,32,109,101,116,104,111,100,0] /* invalid HTTP method\ */, "i8", ALLOC_NONE, 5244740);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,77,69,84,72,79,68,0] /* HPE_INVALID_METHOD\0 */, "i8", ALLOC_NONE, 5244760);
allocate([116,114,97,110,115,102,101,114,45,101,110,99,111,100,105,110,103,0] /* transfer-encoding\00 */, "i8", ALLOC_NONE, 5244780);
allocate([105,110,118,97,108,105,100,32,72,84,84,80,32,115,116,97,116,117,115,32,99,111,100,101,0] /* invalid HTTP status  */, "i8", ALLOC_NONE, 5244800);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,83,84,65,84,85,83,0] /* HPE_INVALID_STATUS\0 */, "i8", ALLOC_NONE, 5244828);
allocate([105,110,118,97,108,105,100,32,72,84,84,80,32,118,101,114,115,105,111,110,0] /* invalid HTTP version */, "i8", ALLOC_NONE, 5244848);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,86,69,82,83,73,79,78,0] /* HPE_INVALID_VERSION\ */, "i8", ALLOC_NONE, 5244872);
allocate([100,97,116,97,32,114,101,99,101,105,118,101,100,32,97,102,116,101,114,32,99,111,109,112,108,101,116,101,100,32,99,111,110,110,101,99,116,105,111,110,58,32,99,108,111,115,101,32,109,101,115,115,97,103,101,0] /* data received after  */, "i8", ALLOC_NONE, 5244892);
allocate([72,80,69,95,67,76,79,83,69,68,95,67,79,78,78,69,67,84,73,79,78,0] /* HPE_CLOSED_CONNECTIO */, "i8", ALLOC_NONE, 5244948);
allocate([116,111,111,32,109,97,110,121,32,104,101,97,100,101,114,32,98,121,116,101,115,32,115,101,101,110,59,32,111,118,101,114,102,108,111,119,32,100,101,116,101,99,116,101,100,0] /* too many header byte */, "i8", ALLOC_NONE, 5244972);
allocate([72,80,69,95,72,69,65,68,69,82,95,79,86,69,82,70,76,79,87,0] /* HPE_HEADER_OVERFLOW\ */, "i8", ALLOC_NONE, 5245020);
allocate([115,116,114,101,97,109,32,101,110,100,101,100,32,97,116,32,97,110,32,117,110,101,120,112,101,99,116,101,100,32,116,105,109,101,0] /* stream ended at an u */, "i8", ALLOC_NONE, 5245040);
allocate([72,80,69,95,73,78,86,65,76,73,68,95,69,79,70,95,83,84,65,84,69,0] /* HPE_INVALID_EOF_STAT */, "i8", ALLOC_NONE, 5245076);
allocate([99,111,110,116,101,110,116,45,108,101,110,103,116,104,0] /* content-length\00 */, "i8", ALLOC_NONE, 5245100);
allocate([116,104,101,32,111,110,95,109,101,115,115,97,103,101,95,99,111,109,112,108,101,116,101,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_message_compl */, "i8", ALLOC_NONE, 5245116);
allocate([72,80,69,95,67,66,95,109,101,115,115,97,103,101,95,99,111,109,112,108,101,116,101,0] /* HPE_CB_message_compl */, "i8", ALLOC_NONE, 5245156);
allocate([116,104,101,32,111,110,95,98,111,100,121,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_body callback */, "i8", ALLOC_NONE, 5245180);
allocate([72,80,69,95,67,66,95,98,111,100,121,0] /* HPE_CB_body\00 */, "i8", ALLOC_NONE, 5245208);
allocate([116,104,101,32,111,110,95,104,101,97,100,101,114,115,95,99,111,109,112,108,101,116,101,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_headers_compl */, "i8", ALLOC_NONE, 5245220);
allocate([72,80,69,95,67,66,95,104,101,97,100,101,114,115,95,99,111,109,112,108,101,116,101,0] /* HPE_CB_headers_compl */, "i8", ALLOC_NONE, 5245260);
allocate([116,104,101,32,111,110,95,104,101,97,100,101,114,95,118,97,108,117,101,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_header_value  */, "i8", ALLOC_NONE, 5245284);
allocate([72,80,69,95,67,66,95,104,101,97,100,101,114,95,118,97,108,117,101,0] /* HPE_CB_header_value\ */, "i8", ALLOC_NONE, 5245320);
allocate([116,104,101,32,111,110,95,104,101,97,100,101,114,95,102,105,101,108,100,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_header_field  */, "i8", ALLOC_NONE, 5245340);
allocate([72,80,69,95,67,66,95,104,101,97,100,101,114,95,102,105,101,108,100,0] /* HPE_CB_header_field\ */, "i8", ALLOC_NONE, 5245376);
allocate([112,114,111,120,121,45,99,111,110,110,101,99,116,105,111,110,0] /* proxy-connection\00 */, "i8", ALLOC_NONE, 5245396);
allocate([116,104,101,32,111,110,95,117,114,108,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_url callback  */, "i8", ALLOC_NONE, 5245416);
allocate([72,80,69,95,67,66,95,117,114,108,0] /* HPE_CB_url\00 */, "i8", ALLOC_NONE, 5245444);
allocate([116,104,101,32,111,110,95,115,116,97,116,117,115,95,99,111,109,112,108,101,116,101,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_status_comple */, "i8", ALLOC_NONE, 5245456);
allocate([72,80,69,95,67,66,95,115,116,97,116,117,115,95,99,111,109,112,108,101,116,101,0] /* HPE_CB_status_comple */, "i8", ALLOC_NONE, 5245496);
allocate([116,104,101,32,111,110,95,109,101,115,115,97,103,101,95,98,101,103,105,110,32,99,97,108,108,98,97,99,107,32,102,97,105,108,101,100,0] /* the on_message_begin */, "i8", ALLOC_NONE, 5245520);
allocate([72,80,69,95,67,66,95,109,101,115,115,97,103,101,95,98,101,103,105,110,0] /* HPE_CB_message_begin */, "i8", ALLOC_NONE, 5245560);
allocate([115,117,99,99,101,115,115,0] /* success\00 */, "i8", ALLOC_NONE, 5245584);
allocate([72,80,69,95,79,75,0] /* HPE_OK\00 */, "i8", ALLOC_NONE, 5245592);
allocate([99,111,110,110,101,99,116,105,111,110,0] /* connection\00 */, "i8", ALLOC_NONE, 5245600);
allocate([101,114,114,32,60,32,40,115,105,122,101,111,102,40,104,116,116,112,95,115,116,114,101,114,114,111,114,95,116,97,98,41,47,115,105,122,101,111,102,40,104,116,116,112,95,115,116,114,101,114,114,111,114,95,116,97,98,91,48,93,41,41,0] /* err _ (sizeof(http_s */, "i8", ALLOC_NONE, 5245612);
allocate([60,117,110,107,110,111,119,110,62,0] /* _unknown_\00 */, "i8", ALLOC_NONE, 5245676);
allocate([40,40,104,101,97,100,101,114,95,102,105,101,108,100,95,109,97,114,107,32,63,32,49,32,58,32,48,41,32,43,32,40,104,101,97,100,101,114,95,118,97,108,117,101,95,109,97,114,107,32,63,32,49,32,58,32,48,41,32,43,32,40,117,114,108,95,109,97,114,107,32,63,32,49,32,58,32,48,41,32,43,32,40,98,111,100,121,95,109,97,114,107,32,63,32,49,32,58,32,48,41,41,32,60,61,32,49,0] /* ((header_field_mark  */, "i8", ALLOC_NONE, 5245688);
allocate([48,32,38,38,32,34,117,110,104,97,110,100,108,101,100,32,115,116,97,116,101,34,0] /* 0 && \22unhandled st */, "i8", ALLOC_NONE, 5245796);
allocate([112,97,114,115,101,114,45,62,99,111,110,116,101,110,116,95,108,101,110,103,116,104,32,61,61,32,48,0] /* parser-_content_leng */, "i8", ALLOC_NONE, 5245820);
allocate([112,97,114,115,101,114,45,62,102,108,97,103,115,32,38,32,70,95,67,72,85,78,75,69,68,0] /* parser-_flags & F_CH */, "i8", ALLOC_NONE, 5245848);
allocate([112,97,114,115,101,114,45,62,110,114,101,97,100,32,61,61,32,49,0] /* parser-_nread == 1\0 */, "i8", ALLOC_NONE, 5245876);
allocate([112,97,114,115,101,114,45,62,99,111,110,116,101,110,116,95,108,101,110,103,116,104,32,33,61,32,48,32,38,38,32,112,97,114,115,101,114,45,62,99,111,110,116,101,110,116,95,108,101,110,103,116,104,32,33,61,32,85,76,76,79,78,71,95,77,65,88,0] /* parser-_content_leng */, "i8", ALLOC_NONE, 5245896);
allocate([99,108,111,115,101,0] /* close\00 */, "i8", ALLOC_NONE, 5245964);
allocate([80,85,82,71,69,0] /* PURGE\00 */, "i8", ALLOC_NONE, 5245972);
allocate([80,65,84,67,72,0] /* PATCH\00 */, "i8", ALLOC_NONE, 5245980);
allocate([85,78,83,85,66,83,67,82,73,66,69,0] /* UNSUBSCRIBE\00 */, "i8", ALLOC_NONE, 5245988);
allocate([83,85,66,83,67,82,73,66,69,0] /* SUBSCRIBE\00 */, "i8", ALLOC_NONE, 5246000);
allocate([78,79,84,73,70,89,0] /* NOTIFY\00 */, "i8", ALLOC_NONE, 5246012);
allocate([77,45,83,69,65,82,67,72,0] /* M-SEARCH\00 */, "i8", ALLOC_NONE, 5246020);
allocate([77,69,82,71,69,0] /* MERGE\00 */, "i8", ALLOC_NONE, 5246032);
allocate([67,72,69,67,75,79,85,84,0] /* CHECKOUT\00 */, "i8", ALLOC_NONE, 5246040);
allocate([107,101,101,112,45,97,108,105,118,101,0] /* keep-alive\00 */, "i8", ALLOC_NONE, 5246052);
allocate([72,84,84,80,95,80,65,82,83,69,82,95,69,82,82,78,79,40,112,97,114,115,101,114,41,32,61,61,32,72,80,69,95,79,75,0] /* HTTP_PARSER_ERRNO(pa */, "i8", ALLOC_NONE, 5246064);
allocate([100,101,112,47,104,116,116,112,45,112,97,114,115,101,114,47,104,116,116,112,95,112,97,114,115,101,114,46,99,0] /* dep/http-parser/http */, "i8", ALLOC_NONE, 5246100);
allocate(468, "i8", ALLOC_NONE, 5246132);
allocate([104,116,116,112,95,112,97,114,115,101,114,95,101,120,101,99,117,116,101,0] /* http_parser_execute\ */, "i8", ALLOC_NONE, 5246600);
allocate([104,116,116,112,95,101,114,114,110,111,95,110,97,109,101,0] /* http_errno_name\00 */, "i8", ALLOC_NONE, 5246620);
allocate([104,116,116,112,95,101,114,114,110,111,95,100,101,115,99,114,105,112,116,105,111,110,0] /* http_errno_descripti */, "i8", ALLOC_NONE, 5246636);
HEAP32[((5243480)>>2)]=((5243972)|0);
HEAP32[((5243484)>>2)]=((5243968)|0);
HEAP32[((5243488)>>2)]=((5243960)|0);
HEAP32[((5243492)>>2)]=((5243952)|0);
HEAP32[((5243496)>>2)]=((5243948)|0);
HEAP32[((5243500)>>2)]=((5243940)|0);
HEAP32[((5243504)>>2)]=((5243932)|0);
HEAP32[((5243508)>>2)]=((5243924)|0);
HEAP32[((5243512)>>2)]=((5243908)|0);
HEAP32[((5243516)>>2)]=((5243900)|0);
HEAP32[((5243520)>>2)]=((5243892)|0);
HEAP32[((5243524)>>2)]=((5243884)|0);
HEAP32[((5243528)>>2)]=((5243872)|0);
HEAP32[((5243532)>>2)]=((5243860)|0);
HEAP32[((5243536)>>2)]=((5243852)|0);
HEAP32[((5243540)>>2)]=((5243844)|0);
HEAP32[((5243544)>>2)]=((5243836)|0);
HEAP32[((5243548)>>2)]=((5243824)|0);
HEAP32[((5243552)>>2)]=((5246040)|0);
HEAP32[((5243556)>>2)]=((5246032)|0);
HEAP32[((5243560)>>2)]=((5246020)|0);
HEAP32[((5243564)>>2)]=((5246012)|0);
HEAP32[((5243568)>>2)]=((5246000)|0);
HEAP32[((5243572)>>2)]=((5245988)|0);
HEAP32[((5243576)>>2)]=((5245980)|0);
HEAP32[((5243580)>>2)]=((5245972)|0);
HEAP32[((5243584)>>2)]=((5245592)|0);
HEAP32[((5243588)>>2)]=((5245584)|0);
HEAP32[((5243592)>>2)]=((5245560)|0);
HEAP32[((5243596)>>2)]=((5245520)|0);
HEAP32[((5243600)>>2)]=((5245496)|0);
HEAP32[((5243604)>>2)]=((5245456)|0);
HEAP32[((5243608)>>2)]=((5245444)|0);
HEAP32[((5243612)>>2)]=((5245416)|0);
HEAP32[((5243616)>>2)]=((5245376)|0);
HEAP32[((5243620)>>2)]=((5245340)|0);
HEAP32[((5243624)>>2)]=((5245320)|0);
HEAP32[((5243628)>>2)]=((5245284)|0);
HEAP32[((5243632)>>2)]=((5245260)|0);
HEAP32[((5243636)>>2)]=((5245220)|0);
HEAP32[((5243640)>>2)]=((5245208)|0);
HEAP32[((5243644)>>2)]=((5245180)|0);
HEAP32[((5243648)>>2)]=((5245156)|0);
HEAP32[((5243652)>>2)]=((5245116)|0);
HEAP32[((5243656)>>2)]=((5245076)|0);
HEAP32[((5243660)>>2)]=((5245040)|0);
HEAP32[((5243664)>>2)]=((5245020)|0);
HEAP32[((5243668)>>2)]=((5244972)|0);
HEAP32[((5243672)>>2)]=((5244948)|0);
HEAP32[((5243676)>>2)]=((5244892)|0);
HEAP32[((5243680)>>2)]=((5244872)|0);
HEAP32[((5243684)>>2)]=((5244848)|0);
HEAP32[((5243688)>>2)]=((5244828)|0);
HEAP32[((5243692)>>2)]=((5244800)|0);
HEAP32[((5243696)>>2)]=((5244760)|0);
HEAP32[((5243700)>>2)]=((5244740)|0);
HEAP32[((5243704)>>2)]=((5244724)|0);
HEAP32[((5243708)>>2)]=((5244712)|0);
HEAP32[((5243712)>>2)]=((5244692)|0);
HEAP32[((5243716)>>2)]=((5244676)|0);
HEAP32[((5243720)>>2)]=((5244656)|0);
HEAP32[((5243724)>>2)]=((5244640)|0);
HEAP32[((5243728)>>2)]=((5244620)|0);
HEAP32[((5243732)>>2)]=((5244604)|0);
HEAP32[((5243736)>>2)]=((5244568)|0);
HEAP32[((5243740)>>2)]=((5244544)|0);
HEAP32[((5243744)>>2)]=((5244520)|0);
HEAP32[((5243748)>>2)]=((5244500)|0);
HEAP32[((5243752)>>2)]=((5244484)|0);
HEAP32[((5243756)>>2)]=((5244460)|0);
HEAP32[((5243760)>>2)]=((5244432)|0);
HEAP32[((5243764)>>2)]=((5244404)|0);
HEAP32[((5243768)>>2)]=((5244376)|0);
HEAP32[((5243772)>>2)]=((5244332)|0);
HEAP32[((5243776)>>2)]=((5244280)|0);
HEAP32[((5243780)>>2)]=((5244240)|0);
HEAP32[((5243784)>>2)]=((5244216)|0);
HEAP32[((5243788)>>2)]=((5244192)|0);
HEAP32[((5243792)>>2)]=((5244164)|0);
HEAP32[((5243796)>>2)]=((5244124)|0);
HEAP32[((5243800)>>2)]=((5244112)|0);
HEAP32[((5243804)>>2)]=((5244080)|0);
HEAP32[((5243808)>>2)]=((5244068)|0);
HEAP32[((5243812)>>2)]=((5244048)|0);
HEAP32[((5243816)>>2)]=((5244008)|0);
HEAP32[((5243820)>>2)]=((5243980)|0);

  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }

  
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if (num|0 >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32;
var _message_begin_cb; // stub for _message_begin_cb
var _url_cb; // stub for _url_cb
var _status_complete_cb; // stub for _status_complete_cb
var _header_field_cb; // stub for _header_field_cb
var _header_value_cb; // stub for _header_value_cb
var _headers_complete_cb; // stub for _headers_complete_cb
var _body_cb; // stub for _body_cb
var _message_complete_cb; // stub for _message_complete_cb

  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }

  
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32;

  
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }

  
  function ___errno_location() {
      return ___setErrNo.ret;
    }var ___errno;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
  
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
      return ret;  // Previous break location.
    }




  function _free(){}

  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],ensureObjects:function () {
        if (Browser.ensured) return;
        Browser.ensured = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(-3)];
          return ret;
        }
  
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return name.substr(-4) in { '.jpg': 1, '.png': 1, '.bmp': 1 };
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
      },createContext:function (canvas, useWebGL, setInModule) {
        try {
          var ctx = canvas.getContext(useWebGL ? 'experimental-webgl' : '2d');
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
        }
        return ctx;
      },requestFullScreen:function () {
        var canvas = Module['canvas'];
        function fullScreenChange() {
          var isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                        canvas['mozRequestPointerLock'] ||
                                        canvas['webkitRequestPointerLock'];
            canvas.requestPointerLock();
            isFullScreen = true;
          }
          if (Module['onFullScreen']) Module['onFullScreen'](isFullScreen);
        }
  
        document.addEventListener('fullscreenchange', fullScreenChange, false);
        document.addEventListener('mozfullscreenchange', fullScreenChange, false);
        document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen(); 
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200) {
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      }};
___setErrNo(0);
Module["requestFullScreen"] = function() { Browser.requestFullScreen() };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  


var FUNCTION_TABLE = [0,0,_header_field_cb,0,_status_complete_cb,0,_url_cb,0,_body_cb,0,_header_value_cb,0,_headers_complete_cb,0,_message_complete_cb,0,_message_begin_cb,0];

function _http_parser_execute($parser, $settings, $data, $len) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $parser | 0;
    var $2 = $1 + 23 | 0;
    var $3 = HEAP8[$2];
    var $4 = $3 & 127;
    var $5 = $4 << 24 >> 24 == 0;
    if ($5) {
      label = 3;
      break;
    } else {
      var $merge = 0;
      label = 8;
      break;
    }
   case 3:
    var $7 = ($len | 0) == 0;
    var $8 = $parser + 1 | 0;
    var $9 = HEAP8[$8];
    if ($7) {
      label = 4;
      break;
    } else {
      label = 10;
      break;
    }
   case 4:
    var $11 = $9 & 255;
    if (($11 | 0) == 57) {
      label = 5;
      break;
    } else if (($11 | 0) == 1 | ($11 | 0) == 2 | ($11 | 0) == 4 | ($11 | 0) == 17) {
      var $merge = 0;
      label = 8;
      break;
    } else {
      label = 9;
      break;
    }
   case 5:
    var $13 = $settings + 28 | 0;
    var $14 = HEAP32[$13 >> 2];
    var $15 = ($14 | 0) == 0;
    if ($15) {
      var $merge = 0;
      label = 8;
      break;
    } else {
      label = 6;
      break;
    }
   case 6:
    var $17 = FUNCTION_TABLE[$14]($parser);
    var $18 = ($17 | 0) == 0;
    if ($18) {
      var $merge = 0;
      label = 8;
      break;
    } else {
      label = 7;
      break;
    }
   case 7:
    var $20 = HEAP8[$2];
    var $21 = $20 & -128;
    var $22 = $21 | 8;
    HEAP8[$2] = $22;
    var $merge = 0;
    label = 8;
    break;
   case 8:
    var $merge;
    return $merge;
   case 9:
    var $24 = $3 & -128;
    var $25 = $24 | 9;
    HEAP8[$2] = $25;
    var $merge = 1;
    label = 8;
    break;
   case 10:
    var $26 = $9 << 24 >> 24 == 42;
    var $data_ = $26 ? $data : 0;
    var $27 = $9 << 24 >> 24 == 44;
    var $header_value_mark_0 = $27 ? $data : 0;
    var $28 = $9 & 255;
    var $_off = $28 - 20 | 0;
    var $switch = $_off >>> 0 < 11;
    var $data_816 = $switch ? $data : 0;
    var $29 = $data + $len | 0;
    var $30 = $parser + 4 | 0;
    var $31 = $parser + 8 | 0;
    var $32 = $settings + 16 | 0;
    var $33 = $parser + 22 | 0;
    var $34 = $settings + 20 | 0;
    var $35 = $29;
    var $36 = $settings + 24 | 0;
    var $37 = $settings | 0;
    var $38 = $parser + 3 | 0;
    var $39 = $parser + 16 | 0;
    var $40 = $parser + 18 | 0;
    var $41 = $parser + 20 | 0;
    var $42 = $settings + 8 | 0;
    var $43 = $settings + 4 | 0;
    var $44 = $parser + 2 | 0;
    var $45 = $settings + 12 | 0;
    var $46 = $settings + 28 | 0;
    var $_sum = $len - 1 | 0;
    var $47 = $data + $_sum | 0;
    var $p_01472 = $data;
    var $header_field_mark_11473 = $data_;
    var $header_value_mark_11474 = $header_value_mark_0;
    var $url_mark_11475 = $data_816;
    var $body_mark_01476 = 0;
    label = 11;
    break;
   case 11:
    var $body_mark_01476;
    var $url_mark_11475;
    var $header_value_mark_11474;
    var $header_field_mark_11473;
    var $p_01472;
    var $49 = HEAP8[$p_01472];
    var $50 = HEAP8[$8];
    var $51 = ($50 & 255) < 53;
    if ($51) {
      label = 13;
      break;
    } else {
      label = 12;
      break;
    }
   case 12:
    var $52 = $49 << 24 >> 24 == 72;
    var $53 = $49 << 24 >> 24;
    var $54 = $49 << 24 >> 24 == 10;
    var $body_mark_1 = $body_mark_01476;
    var $header_value_mark_2 = $header_value_mark_11474;
    var $p_1 = $p_01472;
    var $63 = $50;
    label = 15;
    break;
   case 13:
    var $56 = HEAP32[$30 >> 2];
    var $57 = $56 + 1 | 0;
    HEAP32[$30 >> 2] = $57;
    var $58 = $57 >>> 0 > 81920;
    if ($58) {
      label = 14;
      break;
    } else {
      label = 12;
      break;
    }
   case 14:
    var $60 = HEAP8[$2];
    var $61 = $60 & -128;
    var $62 = $61 | 10;
    HEAP8[$2] = $62;
    var $p_3 = $p_01472;
    label = 553;
    break;
   case 15:
    var $63;
    var $p_1;
    var $header_value_mark_2;
    var $body_mark_1;
    var $64 = $63 & 255;
    if (($64 | 0) == 1) {
      label = 16;
      break;
    } else if (($64 | 0) == 2) {
      label = 18;
      break;
    } else if (($64 | 0) == 3) {
      label = 29;
      break;
    } else if (($64 | 0) == 4) {
      label = 33;
      break;
    } else if (($64 | 0) == 5) {
      label = 43;
      break;
    } else if (($64 | 0) == 6) {
      label = 46;
      break;
    } else if (($64 | 0) == 7) {
      label = 49;
      break;
    } else if (($64 | 0) == 8) {
      label = 52;
      break;
    } else if (($64 | 0) == 9) {
      label = 55;
      break;
    } else if (($64 | 0) == 10) {
      label = 58;
      break;
    } else if (($64 | 0) == 11) {
      label = 64;
      break;
    } else if (($64 | 0) == 12) {
      label = 67;
      break;
    } else if (($64 | 0) == 13) {
      label = 73;
      break;
    } else if (($64 | 0) == 14) {
      label = 77;
      break;
    } else if (($64 | 0) == 15) {
      label = 85;
      break;
    } else if (($64 | 0) == 16) {
      label = 88;
      break;
    } else if (($64 | 0) == 17) {
      label = 97;
      break;
    } else if (($64 | 0) == 18) {
      label = 122;
      break;
    } else if (($64 | 0) == 19) {
      label = 158;
      break;
    } else if (($64 | 0) == 20 | ($64 | 0) == 21 | ($64 | 0) == 22 | ($64 | 0) == 23) {
      label = 163;
      break;
    } else if (($64 | 0) == 24 | ($64 | 0) == 25 | ($64 | 0) == 26 | ($64 | 0) == 27 | ($64 | 0) == 28 | ($64 | 0) == 29 | ($64 | 0) == 30) {
      label = 167;
      break;
    } else if (($64 | 0) == 31) {
      label = 186;
      break;
    } else if (($64 | 0) == 32) {
      label = 189;
      break;
    } else if (($64 | 0) == 33) {
      label = 192;
      break;
    } else if (($64 | 0) == 34) {
      label = 195;
      break;
    } else if (($64 | 0) == 35) {
      label = 198;
      break;
    } else if (($64 | 0) == 36) {
      label = 201;
      break;
    } else if (($64 | 0) == 37) {
      label = 204;
      break;
    } else if (($64 | 0) == 38) {
      label = 210;
      break;
    } else if (($64 | 0) == 39) {
      label = 213;
      break;
    } else if (($64 | 0) == 40) {
      label = 220;
      break;
    } else if (($64 | 0) == 41) {
      label = 223;
      break;
    } else if (($64 | 0) == 42) {
      label = 234;
      break;
    } else if (($64 | 0) == 43) {
      label = 296;
      break;
    } else if (($64 | 0) == 44) {
      label = 327;
      break;
    } else if (($64 | 0) == 46) {
      label = 370;
      break;
    } else if (($64 | 0) == 45) {
      label = 376;
      break;
    } else if (($64 | 0) == 51) {
      label = 379;
      break;
    } else if (($64 | 0) == 52) {
      label = 399;
      break;
    } else if (($64 | 0) == 56) {
      label = 447;
      break;
    } else if (($64 | 0) == 57) {
      label = 458;
      break;
    } else if (($64 | 0) == 58) {
      label = 459;
      break;
    } else if (($64 | 0) == 47) {
      label = 468;
      break;
    } else if (($64 | 0) == 48) {
      label = 475;
      break;
    } else if (($64 | 0) == 49) {
      label = 486;
      break;
    } else if (($64 | 0) == 50) {
      label = 490;
      break;
    } else if (($64 | 0) == 53) {
      label = 497;
      break;
    } else if (($64 | 0) == 54) {
      label = 503;
      break;
    } else if (($64 | 0) == 55) {
      label = 517;
      break;
    } else {
      label = 522;
      break;
    }
   case 16:
    if ($49 << 24 >> 24 == 13 | $49 << 24 >> 24 == 10) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 17;
      break;
    }
   case 17:
    var $67 = HEAP8[$2];
    var $68 = $67 & -128;
    var $69 = $68 | 11;
    HEAP8[$2] = $69;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 18:
    if ($49 << 24 >> 24 == 13 | $49 << 24 >> 24 == 10) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 19;
      break;
    }
   case 19:
    var $72 = HEAP8[$1];
    var $73 = $72 & 3;
    HEAP8[$1] = $73;
    var $$etemp$0$0 = -1;
    var $$etemp$0$1 = -1;
    var $st$5$0 = $31 | 0;
    HEAP32[$st$5$0 >> 2] = $$etemp$0$0;
    var $st$5$1 = $31 + 4 | 0;
    HEAP32[$st$5$1 >> 2] = $$etemp$0$1;
    if ($52) {
      label = 20;
      break;
    } else {
      label = 27;
      break;
    }
   case 20:
    HEAP8[$8] = 3;
    var $75 = HEAP8[$2];
    var $76 = $75 & 127;
    var $77 = $76 << 24 >> 24 == 0;
    if ($77) {
      label = 22;
      break;
    } else {
      label = 21;
      break;
    }
   case 21:
    ___assert_func(5246100, 667, 5246600, 5246064);
    label = 22;
    break;
   case 22:
    var $80 = HEAP32[$37 >> 2];
    var $81 = ($80 | 0) == 0;
    if ($81) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 23;
      break;
    }
   case 23:
    var $83 = FUNCTION_TABLE[$80]($parser);
    var $84 = ($83 | 0) == 0;
    var $_pre58 = HEAP8[$2];
    if ($84) {
      var $88 = $_pre58;
      label = 25;
      break;
    } else {
      label = 24;
      break;
    }
   case 24:
    var $86 = $_pre58 & -128;
    var $87 = $86 | 1;
    HEAP8[$2] = $87;
    var $88 = $87;
    label = 25;
    break;
   case 25:
    var $88;
    var $89 = $88 & 127;
    var $90 = $89 << 24 >> 24 == 0;
    if ($90) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 26;
      break;
    }
   case 26:
    var $92 = $p_1;
    var $93 = $data;
    var $94 = 1 - $93 | 0;
    var $95 = $94 + $92 | 0;
    var $merge = $95;
    label = 8;
    break;
   case 27:
    HEAP8[$1] = 0;
    HEAP8[$8] = 17;
    var $body_mark_1_be = $body_mark_1;
    var $header_value_mark_2_be = $header_value_mark_2;
    var $p_1_be = $p_1;
    label = 28;
    break;
   case 28:
    var $p_1_be;
    var $header_value_mark_2_be;
    var $body_mark_1_be;
    var $_pre = HEAP8[$8];
    var $body_mark_1 = $body_mark_1_be;
    var $header_value_mark_2 = $header_value_mark_2_be;
    var $p_1 = $p_1_be;
    var $63 = $_pre;
    label = 15;
    break;
   case 29:
    if ($49 << 24 >> 24 == 84) {
      label = 30;
      break;
    } else if ($49 << 24 >> 24 == 69) {
      label = 32;
      break;
    } else {
      label = 31;
      break;
    }
   case 30:
    var $99 = HEAP8[$1];
    var $100 = $99 & -4;
    var $101 = $100 | 1;
    HEAP8[$1] = $101;
    HEAP8[$8] = 6;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 31:
    var $103 = HEAP8[$2];
    var $104 = $103 & -128;
    var $105 = $104 | 25;
    HEAP8[$2] = $105;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 32:
    var $107 = HEAP8[$1];
    var $108 = $107 & -4;
    HEAP8[$1] = $108;
    HEAP8[$33] = 2;
    HEAP8[$38] = 2;
    HEAP8[$8] = 18;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 33:
    var $110 = HEAP8[$1];
    var $111 = $110 & 3;
    HEAP8[$1] = $111;
    var $$etemp$1$0 = -1;
    var $$etemp$1$1 = -1;
    var $st$5$0 = $31 | 0;
    HEAP32[$st$5$0 >> 2] = $$etemp$1$0;
    var $st$5$1 = $31 + 4 | 0;
    HEAP32[$st$5$1 >> 2] = $$etemp$1$1;
    if (($53 | 0) == 72) {
      label = 34;
      break;
    } else if (($53 | 0) == 13 | ($53 | 0) == 10) {
      label = 36;
      break;
    } else {
      label = 35;
      break;
    }
   case 34:
    HEAP8[$8] = 5;
    label = 36;
    break;
   case 35:
    var $114 = HEAP8[$2];
    var $115 = $114 & -128;
    var $116 = $115 | 25;
    HEAP8[$2] = $116;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 36:
    var $117 = HEAP8[$2];
    var $118 = $117 & 127;
    var $119 = $118 << 24 >> 24 == 0;
    if ($119) {
      label = 38;
      break;
    } else {
      label = 37;
      break;
    }
   case 37:
    ___assert_func(5246100, 713, 5246600, 5246064);
    label = 38;
    break;
   case 38:
    var $122 = HEAP32[$37 >> 2];
    var $123 = ($122 | 0) == 0;
    if ($123) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 39;
      break;
    }
   case 39:
    var $125 = FUNCTION_TABLE[$122]($parser);
    var $126 = ($125 | 0) == 0;
    var $_pre59 = HEAP8[$2];
    if ($126) {
      var $130 = $_pre59;
      label = 41;
      break;
    } else {
      label = 40;
      break;
    }
   case 40:
    var $128 = $_pre59 & -128;
    var $129 = $128 | 1;
    HEAP8[$2] = $129;
    var $130 = $129;
    label = 41;
    break;
   case 41:
    var $130;
    var $131 = $130 & 127;
    var $132 = $131 << 24 >> 24 == 0;
    if ($132) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 42;
      break;
    }
   case 42:
    var $134 = $p_1;
    var $135 = $data;
    var $136 = 1 - $135 | 0;
    var $137 = $136 + $134 | 0;
    var $merge = $137;
    label = 8;
    break;
   case 43:
    var $139 = $49 << 24 >> 24 == 84;
    if ($139) {
      label = 45;
      break;
    } else {
      label = 44;
      break;
    }
   case 44:
    var $141 = HEAP8[$2];
    var $142 = $141 & -128;
    var $143 = $142 | 27;
    HEAP8[$2] = $143;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 45:
    HEAP8[$8] = 6;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 46:
    var $146 = $49 << 24 >> 24 == 84;
    if ($146) {
      label = 48;
      break;
    } else {
      label = 47;
      break;
    }
   case 47:
    var $148 = HEAP8[$2];
    var $149 = $148 & -128;
    var $150 = $149 | 27;
    HEAP8[$2] = $150;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 48:
    HEAP8[$8] = 7;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 49:
    var $153 = $49 << 24 >> 24 == 80;
    if ($153) {
      label = 51;
      break;
    } else {
      label = 50;
      break;
    }
   case 50:
    var $155 = HEAP8[$2];
    var $156 = $155 & -128;
    var $157 = $156 | 27;
    HEAP8[$2] = $157;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 51:
    HEAP8[$8] = 8;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 52:
    var $160 = $49 << 24 >> 24 == 47;
    if ($160) {
      label = 54;
      break;
    } else {
      label = 53;
      break;
    }
   case 53:
    var $162 = HEAP8[$2];
    var $163 = $162 & -128;
    var $164 = $163 | 27;
    HEAP8[$2] = $164;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 54:
    HEAP8[$8] = 9;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 55:
    var $_off854 = $49 - 48 & 255;
    var $167 = ($_off854 & 255) > 9;
    if ($167) {
      label = 56;
      break;
    } else {
      label = 57;
      break;
    }
   case 56:
    var $169 = HEAP8[$2];
    var $170 = $169 & -128;
    var $171 = $170 | 12;
    HEAP8[$2] = $171;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 57:
    var $173 = $49 << 24 >> 24;
    var $174 = $173 - 48 & 65535;
    HEAP16[$39 >> 1] = $174;
    HEAP8[$8] = 10;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 58:
    var $176 = $49 << 24 >> 24;
    var $177 = $49 << 24 >> 24 == 46;
    if ($177) {
      label = 59;
      break;
    } else {
      label = 60;
      break;
    }
   case 59:
    HEAP8[$8] = 11;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 60:
    var $_off853 = $49 - 48 & 255;
    var $180 = ($_off853 & 255) < 10;
    if ($180) {
      label = 62;
      break;
    } else {
      label = 61;
      break;
    }
   case 61:
    var $182 = HEAP8[$2];
    var $183 = $182 & -128;
    var $184 = $183 | 12;
    HEAP8[$2] = $184;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 62:
    var $186 = HEAP16[$39 >> 1];
    var $187 = $186 * 10 & -1;
    var $188 = $176 - 48 & 65535;
    var $189 = $188 + $187 & 65535;
    HEAP16[$39 >> 1] = $189;
    var $190 = ($189 & 65535) > 999;
    if ($190) {
      label = 63;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 63:
    var $192 = HEAP8[$2];
    var $193 = $192 & -128;
    var $194 = $193 | 12;
    HEAP8[$2] = $194;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 64:
    var $_off852 = $49 - 48 & 255;
    var $196 = ($_off852 & 255) < 10;
    if ($196) {
      label = 66;
      break;
    } else {
      label = 65;
      break;
    }
   case 65:
    var $198 = HEAP8[$2];
    var $199 = $198 & -128;
    var $200 = $199 | 12;
    HEAP8[$2] = $200;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 66:
    var $202 = $49 << 24 >> 24;
    var $203 = $202 - 48 & 65535;
    HEAP16[$40 >> 1] = $203;
    HEAP8[$8] = 12;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 67:
    var $205 = $49 << 24 >> 24;
    var $206 = $49 << 24 >> 24 == 32;
    if ($206) {
      label = 68;
      break;
    } else {
      label = 69;
      break;
    }
   case 68:
    HEAP8[$8] = 13;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 69:
    var $_off851 = $49 - 48 & 255;
    var $209 = ($_off851 & 255) < 10;
    if ($209) {
      label = 71;
      break;
    } else {
      label = 70;
      break;
    }
   case 70:
    var $211 = HEAP8[$2];
    var $212 = $211 & -128;
    var $213 = $212 | 12;
    HEAP8[$2] = $213;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 71:
    var $215 = HEAP16[$40 >> 1];
    var $216 = $215 * 10 & -1;
    var $217 = $205 - 48 & 65535;
    var $218 = $217 + $216 & 65535;
    HEAP16[$40 >> 1] = $218;
    var $219 = ($218 & 65535) > 999;
    if ($219) {
      label = 72;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 72:
    var $221 = HEAP8[$2];
    var $222 = $221 & -128;
    var $223 = $222 | 12;
    HEAP8[$2] = $223;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 73:
    var $_off850 = $49 - 48 & 255;
    var $225 = ($_off850 & 255) < 10;
    if ($225) {
      label = 76;
      break;
    } else {
      label = 74;
      break;
    }
   case 74:
    var $227 = $49 << 24 >> 24 == 32;
    if ($227) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 75;
      break;
    }
   case 75:
    var $229 = HEAP8[$2];
    var $230 = $229 & -128;
    var $231 = $230 | 13;
    HEAP8[$2] = $231;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 76:
    var $233 = $49 << 24 >> 24;
    var $234 = $233 - 48 & 65535;
    HEAP16[$41 >> 1] = $234;
    HEAP8[$8] = 14;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 77:
    var $_off849 = $49 - 48 & 255;
    var $236 = ($_off849 & 255) < 10;
    if ($236) {
      label = 83;
      break;
    } else {
      label = 78;
      break;
    }
   case 78:
    if (($53 | 0) == 32) {
      label = 79;
      break;
    } else if (($53 | 0) == 13) {
      label = 80;
      break;
    } else if (($53 | 0) == 10) {
      label = 81;
      break;
    } else {
      label = 82;
      break;
    }
   case 79:
    HEAP8[$8] = 15;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 80:
    HEAP8[$8] = 16;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 81:
    HEAP8[$8] = 41;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 82:
    var $242 = HEAP8[$2];
    var $243 = $242 & -128;
    var $244 = $243 | 13;
    HEAP8[$2] = $244;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 83:
    var $246 = HEAP16[$41 >> 1];
    var $247 = $246 * 10 & -1;
    var $248 = $53 + 65488 | 0;
    var $249 = $247 & 65535;
    var $250 = $248 + $249 | 0;
    var $251 = $250 & 65535;
    HEAP16[$41 >> 1] = $251;
    var $252 = $250 & 65528;
    var $253 = $252 >>> 0 > 999;
    if ($253) {
      label = 84;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 84:
    var $255 = HEAP8[$2];
    var $256 = $255 & -128;
    var $257 = $256 | 13;
    HEAP8[$2] = $257;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 85:
    if ($49 << 24 >> 24 == 13) {
      label = 86;
      break;
    } else if ($49 << 24 >> 24 == 10) {
      label = 87;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 86:
    HEAP8[$8] = 16;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 87:
    HEAP8[$8] = 41;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 88:
    if ($54) {
      label = 90;
      break;
    } else {
      label = 89;
      break;
    }
   case 89:
    var $263 = HEAP8[$2];
    var $264 = $263 & -128;
    var $265 = $264 | 27;
    HEAP8[$2] = $265;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 90:
    HEAP8[$8] = 41;
    var $267 = HEAP8[$2];
    var $268 = $267 & 127;
    var $269 = $268 << 24 >> 24 == 0;
    if ($269) {
      label = 92;
      break;
    } else {
      label = 91;
      break;
    }
   case 91:
    ___assert_func(5246100, 869, 5246600, 5246064);
    label = 92;
    break;
   case 92:
    var $272 = HEAP32[$42 >> 2];
    var $273 = ($272 | 0) == 0;
    if ($273) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 93;
      break;
    }
   case 93:
    var $275 = FUNCTION_TABLE[$272]($parser);
    var $276 = ($275 | 0) == 0;
    var $_pre60 = HEAP8[$2];
    if ($276) {
      var $280 = $_pre60;
      label = 95;
      break;
    } else {
      label = 94;
      break;
    }
   case 94:
    var $278 = $_pre60 & -128;
    var $279 = $278 | 2;
    HEAP8[$2] = $279;
    var $280 = $279;
    label = 95;
    break;
   case 95:
    var $280;
    var $281 = $280 & 127;
    var $282 = $281 << 24 >> 24 == 0;
    if ($282) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 96;
      break;
    }
   case 96:
    var $284 = $p_1;
    var $285 = $data;
    var $286 = 1 - $285 | 0;
    var $287 = $286 + $284 | 0;
    var $merge = $287;
    label = 8;
    break;
   case 97:
    if ($49 << 24 >> 24 == 13 | $49 << 24 >> 24 == 10) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 98;
      break;
    }
   case 98:
    var $290 = HEAP8[$1];
    var $291 = $290 & 3;
    HEAP8[$1] = $291;
    var $$etemp$2$0 = -1;
    var $$etemp$2$1 = -1;
    var $st$5$0 = $31 | 0;
    HEAP32[$st$5$0 >> 2] = $$etemp$2$0;
    var $st$5$1 = $31 + 4 | 0;
    HEAP32[$st$5$1 >> 2] = $$etemp$2$1;
    var $292 = $49 | 32;
    var $_off848 = $292 - 97 & 255;
    var $293 = ($_off848 & 255) < 26;
    if ($293) {
      label = 100;
      break;
    } else {
      label = 99;
      break;
    }
   case 99:
    var $295 = HEAP8[$2];
    var $296 = $295 & -128;
    var $297 = $296 | 14;
    HEAP8[$2] = $297;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 100:
    HEAP8[$33] = 0;
    HEAP8[$38] = 1;
    if (($53 | 0) == 67) {
      label = 101;
      break;
    } else if (($53 | 0) == 68) {
      label = 102;
      break;
    } else if (($53 | 0) == 71) {
      label = 103;
      break;
    } else if (($53 | 0) == 72) {
      label = 104;
      break;
    } else if (($53 | 0) == 76) {
      label = 105;
      break;
    } else if (($53 | 0) == 77) {
      label = 106;
      break;
    } else if (($53 | 0) == 78) {
      label = 107;
      break;
    } else if (($53 | 0) == 79) {
      label = 108;
      break;
    } else if (($53 | 0) == 80) {
      label = 109;
      break;
    } else if (($53 | 0) == 82) {
      label = 110;
      break;
    } else if (($53 | 0) == 83) {
      label = 111;
      break;
    } else if (($53 | 0) == 84) {
      label = 112;
      break;
    } else if (($53 | 0) == 85) {
      label = 113;
      break;
    } else {
      label = 114;
      break;
    }
   case 101:
    HEAP8[$33] = 5;
    label = 115;
    break;
   case 102:
    HEAP8[$33] = 0;
    label = 115;
    break;
   case 103:
    HEAP8[$33] = 1;
    label = 115;
    break;
   case 104:
    HEAP8[$33] = 2;
    label = 115;
    break;
   case 105:
    HEAP8[$33] = 9;
    label = 115;
    break;
   case 106:
    HEAP8[$33] = 10;
    label = 115;
    break;
   case 107:
    HEAP8[$33] = 21;
    label = 115;
    break;
   case 108:
    HEAP8[$33] = 6;
    label = 115;
    break;
   case 109:
    HEAP8[$33] = 3;
    label = 115;
    break;
   case 110:
    HEAP8[$33] = 16;
    label = 115;
    break;
   case 111:
    HEAP8[$33] = 22;
    label = 115;
    break;
   case 112:
    HEAP8[$33] = 7;
    label = 115;
    break;
   case 113:
    HEAP8[$33] = 15;
    label = 115;
    break;
   case 114:
    var $313 = HEAP8[$2];
    var $314 = $313 & -128;
    var $315 = $314 | 14;
    HEAP8[$2] = $315;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 115:
    HEAP8[$8] = 18;
    var $317 = HEAP8[$2];
    var $318 = $317 & 127;
    var $319 = $318 << 24 >> 24 == 0;
    if ($319) {
      label = 117;
      break;
    } else {
      label = 116;
      break;
    }
   case 116:
    ___assert_func(5246100, 908, 5246600, 5246064);
    label = 117;
    break;
   case 117:
    var $322 = HEAP32[$37 >> 2];
    var $323 = ($322 | 0) == 0;
    if ($323) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 118;
      break;
    }
   case 118:
    var $325 = FUNCTION_TABLE[$322]($parser);
    var $326 = ($325 | 0) == 0;
    var $_pre61 = HEAP8[$2];
    if ($326) {
      var $330 = $_pre61;
      label = 120;
      break;
    } else {
      label = 119;
      break;
    }
   case 119:
    var $328 = $_pre61 & -128;
    var $329 = $328 | 1;
    HEAP8[$2] = $329;
    var $330 = $329;
    label = 120;
    break;
   case 120:
    var $330;
    var $331 = $330 & 127;
    var $332 = $331 << 24 >> 24 == 0;
    if ($332) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 121;
      break;
    }
   case 121:
    var $334 = $p_1;
    var $335 = $data;
    var $336 = 1 - $335 | 0;
    var $337 = $336 + $334 | 0;
    var $merge = $337;
    label = 8;
    break;
   case 122:
    var $339 = $49 << 24 >> 24 == 0;
    if ($339) {
      label = 123;
      break;
    } else {
      label = 124;
      break;
    }
   case 123:
    var $341 = HEAP8[$2];
    var $342 = $341 & -128;
    var $343 = $342 | 14;
    HEAP8[$2] = $343;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 124:
    var $345 = HEAP8[$33];
    var $346 = $345 & 255;
    var $347 = 5243480 + ($346 << 2) | 0;
    var $348 = HEAP32[$347 >> 2];
    var $349 = $49 << 24 >> 24 == 32;
    var $350 = HEAP8[$38];
    var $351 = $350 & 255;
    var $352 = $348 + $351 | 0;
    var $353 = HEAP8[$352];
    var $354 = $353 << 24 >> 24 == 0;
    var $or_cond83 = $349 & $354;
    if ($or_cond83) {
      label = 125;
      break;
    } else {
      label = 126;
      break;
    }
   case 125:
    HEAP8[$8] = 19;
    var $407 = $350;
    label = 157;
    break;
   case 126:
    var $356 = $49 << 24 >> 24 == $353 << 24 >> 24;
    if ($356) {
      var $407 = $350;
      label = 157;
      break;
    } else {
      label = 127;
      break;
    }
   case 127:
    if ($345 << 24 >> 24 == 5) {
      label = 128;
      break;
    } else if ($345 << 24 >> 24 == 10) {
      label = 132;
      break;
    } else {
      label = 140;
      break;
    }
   case 128:
    var $359 = $350 << 24 >> 24 == 1;
    var $or_cond824 = $359 & $52;
    if ($or_cond824) {
      label = 129;
      break;
    } else {
      label = 130;
      break;
    }
   case 129:
    HEAP8[$33] = 18;
    var $407 = 1;
    label = 157;
    break;
   case 130:
    var $362 = $350 << 24 >> 24 == 2;
    var $363 = $49 << 24 >> 24 == 80;
    var $or_cond825 = $362 & $363;
    if ($or_cond825) {
      label = 131;
      break;
    } else {
      var $p_3 = $p_1;
      label = 553;
      break;
    }
   case 131:
    HEAP8[$33] = 8;
    var $407 = 2;
    label = 157;
    break;
   case 132:
    var $366 = $350 << 24 >> 24 == 1;
    var $367 = $49 << 24 >> 24 == 79;
    var $or_cond826 = $366 & $367;
    if ($or_cond826) {
      label = 133;
      break;
    } else {
      label = 134;
      break;
    }
   case 133:
    HEAP8[$33] = 11;
    var $407 = 1;
    label = 157;
    break;
   case 134:
    var $370 = $49 << 24 >> 24 == 69;
    var $or_cond827 = $366 & $370;
    if ($or_cond827) {
      label = 135;
      break;
    } else {
      label = 136;
      break;
    }
   case 135:
    HEAP8[$33] = 19;
    var $407 = 1;
    label = 157;
    break;
   case 136:
    var $373 = $49 << 24 >> 24 == 45;
    var $or_cond828 = $366 & $373;
    if ($or_cond828) {
      label = 137;
      break;
    } else {
      label = 138;
      break;
    }
   case 137:
    HEAP8[$33] = 20;
    var $407 = 1;
    label = 157;
    break;
   case 138:
    var $376 = $350 << 24 >> 24 == 2;
    var $377 = $49 << 24 >> 24 == 65;
    var $or_cond829 = $376 & $377;
    if ($or_cond829) {
      label = 139;
      break;
    } else {
      var $p_3 = $p_1;
      label = 553;
      break;
    }
   case 139:
    HEAP8[$33] = 17;
    var $407 = 2;
    label = 157;
    break;
   case 140:
    var $380 = $345 << 24 >> 24 == 22;
    var $381 = $350 << 24 >> 24 == 1;
    if ($380) {
      label = 141;
      break;
    } else {
      label = 143;
      break;
    }
   case 141:
    var $383 = $49 << 24 >> 24 == 69;
    var $or_cond830 = $381 & $383;
    if ($or_cond830) {
      label = 142;
      break;
    } else {
      var $p_3 = $p_1;
      label = 553;
      break;
    }
   case 142:
    HEAP8[$33] = 14;
    var $407 = 1;
    label = 157;
    break;
   case 143:
    var $386 = $345 << 24 >> 24 == 3;
    var $or_cond831 = $381 & $386;
    if ($or_cond831) {
      label = 144;
      break;
    } else {
      label = 148;
      break;
    }
   case 144:
    if ($49 << 24 >> 24 == 82) {
      label = 145;
      break;
    } else if ($49 << 24 >> 24 == 85) {
      label = 146;
      break;
    } else if ($49 << 24 >> 24 == 65) {
      label = 147;
      break;
    } else {
      var $p_3 = $p_1;
      label = 553;
      break;
    }
   case 145:
    HEAP8[$33] = 12;
    var $407 = 1;
    label = 157;
    break;
   case 146:
    HEAP8[$33] = 4;
    var $407 = 1;
    label = 157;
    break;
   case 147:
    HEAP8[$33] = 24;
    var $407 = 1;
    label = 157;
    break;
   case 148:
    if ($350 << 24 >> 24 == 2) {
      label = 149;
      break;
    } else if ($350 << 24 >> 24 == 4) {
      label = 154;
      break;
    } else {
      label = 156;
      break;
    }
   case 149:
    if ($345 << 24 >> 24 == 4) {
      label = 150;
      break;
    } else if ($345 << 24 >> 24 == 15) {
      label = 152;
      break;
    } else {
      var $407 = 2;
      label = 157;
      break;
    }
   case 150:
    var $394 = $49 << 24 >> 24 == 82;
    if ($394) {
      label = 151;
      break;
    } else {
      var $407 = 2;
      label = 157;
      break;
    }
   case 151:
    HEAP8[$33] = 25;
    var $407 = 2;
    label = 157;
    break;
   case 152:
    var $397 = $49 << 24 >> 24 == 83;
    if ($397) {
      label = 153;
      break;
    } else {
      var $407 = 2;
      label = 157;
      break;
    }
   case 153:
    HEAP8[$33] = 23;
    var $407 = 2;
    label = 157;
    break;
   case 154:
    var $400 = $345 << 24 >> 24 == 12;
    var $401 = $49 << 24 >> 24 == 80;
    var $or_cond832 = $400 & $401;
    if ($or_cond832) {
      label = 155;
      break;
    } else {
      label = 156;
      break;
    }
   case 155:
    HEAP8[$33] = 13;
    var $407 = 4;
    label = 157;
    break;
   case 156:
    var $403 = HEAP8[$2];
    var $404 = $403 & -128;
    var $405 = $404 | 14;
    HEAP8[$2] = $405;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 157:
    var $407;
    var $408 = $407 + 1 & 255;
    HEAP8[$38] = $408;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 158:
    var $410 = $49 << 24 >> 24 == 32;
    if ($410) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 159;
      break;
    }
   case 159:
    var $412 = ($url_mark_11475 | 0) == 0;
    var $p_1_url_mark_1 = $412 ? $p_1 : $url_mark_11475;
    var $413 = HEAP8[$33];
    var $414 = $413 << 24 >> 24 == 5;
    if ($414) {
      label = 160;
      break;
    } else {
      var $417 = $63;
      label = 161;
      break;
    }
   case 160:
    HEAP8[$8] = 23;
    var $417 = 23;
    label = 161;
    break;
   case 161:
    var $417;
    var $418 = $417 & 255;
    var $419 = _parse_url_char($418, $49);
    var $420 = $419 & 255;
    HEAP8[$8] = $420;
    var $421 = $419 & 255;
    var $422 = ($421 | 0) == 1;
    if ($422) {
      label = 162;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $p_1_url_mark_1;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 162:
    var $424 = HEAP8[$2];
    var $425 = $424 & -128;
    var $426 = $425 | 15;
    HEAP8[$2] = $426;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 163:
    if (($53 | 0) == 32 | ($53 | 0) == 13 | ($53 | 0) == 10) {
      label = 164;
      break;
    } else {
      label = 165;
      break;
    }
   case 164:
    var $428 = HEAP8[$2];
    var $429 = $428 & -128;
    var $430 = $429 | 15;
    HEAP8[$2] = $430;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 165:
    var $432 = _parse_url_char($64, $49);
    var $433 = $432 & 255;
    HEAP8[$8] = $433;
    var $434 = $432 & 255;
    var $435 = ($434 | 0) == 1;
    if ($435) {
      label = 166;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 166:
    var $437 = HEAP8[$2];
    var $438 = $437 & -128;
    var $439 = $438 | 15;
    HEAP8[$2] = $439;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 167:
    if (($53 | 0) == 32) {
      label = 168;
      break;
    } else if (($53 | 0) == 13 | ($53 | 0) == 10) {
      label = 176;
      break;
    } else {
      label = 184;
      break;
    }
   case 168:
    HEAP8[$8] = 31;
    var $442 = HEAP8[$2];
    var $443 = $442 & 127;
    var $444 = $443 << 24 >> 24 == 0;
    if ($444) {
      label = 170;
      break;
    } else {
      label = 169;
      break;
    }
   case 169:
    ___assert_func(5246100, 1031, 5246600, 5246064);
    label = 170;
    break;
   case 170:
    var $447 = ($url_mark_11475 | 0) == 0;
    if ($447) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = 0;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 171;
      break;
    }
   case 171:
    var $449 = HEAP32[$43 >> 2];
    var $450 = ($449 | 0) == 0;
    if ($450) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = 0;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 172;
      break;
    }
   case 172:
    var $452 = $p_1;
    var $453 = $url_mark_11475;
    var $454 = $452 - $453 | 0;
    var $455 = FUNCTION_TABLE[$449]($parser, $url_mark_11475, $454);
    var $456 = ($455 | 0) == 0;
    var $_pre62 = HEAP8[$2];
    if ($456) {
      var $460 = $_pre62;
      label = 174;
      break;
    } else {
      label = 173;
      break;
    }
   case 173:
    var $458 = $_pre62 & -128;
    var $459 = $458 | 3;
    HEAP8[$2] = $459;
    var $460 = $459;
    label = 174;
    break;
   case 174:
    var $460;
    var $461 = $460 & 127;
    var $462 = $461 << 24 >> 24 == 0;
    if ($462) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = 0;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 175;
      break;
    }
   case 175:
    var $464 = $data;
    var $465 = 1 - $464 | 0;
    var $466 = $465 + $452 | 0;
    var $merge = $466;
    label = 8;
    break;
   case 176:
    HEAP16[$39 >> 1] = 0;
    HEAP16[$40 >> 1] = 9;
    var $467 = $49 << 24 >> 24 == 13;
    var $468 = $467 ? 40 : 41;
    HEAP8[$8] = $468;
    var $469 = HEAP8[$2];
    var $470 = $469 & 127;
    var $471 = $470 << 24 >> 24 == 0;
    if ($471) {
      label = 178;
      break;
    } else {
      label = 177;
      break;
    }
   case 177:
    ___assert_func(5246100, 1040, 5246600, 5246064);
    label = 178;
    break;
   case 178:
    var $474 = ($url_mark_11475 | 0) == 0;
    if ($474) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = 0;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 179;
      break;
    }
   case 179:
    var $476 = HEAP32[$43 >> 2];
    var $477 = ($476 | 0) == 0;
    if ($477) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = 0;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 180;
      break;
    }
   case 180:
    var $479 = $p_1;
    var $480 = $url_mark_11475;
    var $481 = $479 - $480 | 0;
    var $482 = FUNCTION_TABLE[$476]($parser, $url_mark_11475, $481);
    var $483 = ($482 | 0) == 0;
    var $_pre63 = HEAP8[$2];
    if ($483) {
      var $487 = $_pre63;
      label = 182;
      break;
    } else {
      label = 181;
      break;
    }
   case 181:
    var $485 = $_pre63 & -128;
    var $486 = $485 | 3;
    HEAP8[$2] = $486;
    var $487 = $486;
    label = 182;
    break;
   case 182:
    var $487;
    var $488 = $487 & 127;
    var $489 = $488 << 24 >> 24 == 0;
    if ($489) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = 0;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 183;
      break;
    }
   case 183:
    var $491 = $data;
    var $492 = 1 - $491 | 0;
    var $493 = $492 + $479 | 0;
    var $merge = $493;
    label = 8;
    break;
   case 184:
    var $495 = _parse_url_char($64, $49);
    var $496 = $495 & 255;
    HEAP8[$8] = $496;
    var $497 = $495 & 255;
    var $498 = ($497 | 0) == 1;
    if ($498) {
      label = 185;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 185:
    var $500 = HEAP8[$2];
    var $501 = $500 & -128;
    var $502 = $501 | 15;
    HEAP8[$2] = $502;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 186:
    if (($53 | 0) == 72) {
      label = 187;
      break;
    } else if (($53 | 0) == 32) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 188;
      break;
    }
   case 187:
    HEAP8[$8] = 32;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 188:
    var $506 = HEAP8[$2];
    var $507 = $506 & -128;
    var $508 = $507 | 25;
    HEAP8[$2] = $508;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 189:
    var $510 = $49 << 24 >> 24 == 84;
    if ($510) {
      label = 191;
      break;
    } else {
      label = 190;
      break;
    }
   case 190:
    var $512 = HEAP8[$2];
    var $513 = $512 & -128;
    var $514 = $513 | 27;
    HEAP8[$2] = $514;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 191:
    HEAP8[$8] = 33;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 192:
    var $517 = $49 << 24 >> 24 == 84;
    if ($517) {
      label = 194;
      break;
    } else {
      label = 193;
      break;
    }
   case 193:
    var $519 = HEAP8[$2];
    var $520 = $519 & -128;
    var $521 = $520 | 27;
    HEAP8[$2] = $521;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 194:
    HEAP8[$8] = 34;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 195:
    var $524 = $49 << 24 >> 24 == 80;
    if ($524) {
      label = 197;
      break;
    } else {
      label = 196;
      break;
    }
   case 196:
    var $526 = HEAP8[$2];
    var $527 = $526 & -128;
    var $528 = $527 | 27;
    HEAP8[$2] = $528;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 197:
    HEAP8[$8] = 35;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 198:
    var $531 = $49 << 24 >> 24 == 47;
    if ($531) {
      label = 200;
      break;
    } else {
      label = 199;
      break;
    }
   case 199:
    var $533 = HEAP8[$2];
    var $534 = $533 & -128;
    var $535 = $534 | 27;
    HEAP8[$2] = $535;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 200:
    HEAP8[$8] = 36;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 201:
    var $_off847 = $49 - 49 & 255;
    var $538 = ($_off847 & 255) > 8;
    if ($538) {
      label = 202;
      break;
    } else {
      label = 203;
      break;
    }
   case 202:
    var $540 = HEAP8[$2];
    var $541 = $540 & -128;
    var $542 = $541 | 12;
    HEAP8[$2] = $542;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 203:
    var $544 = $49 << 24 >> 24;
    var $545 = $544 - 48 & 65535;
    HEAP16[$39 >> 1] = $545;
    HEAP8[$8] = 37;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 204:
    var $547 = $49 << 24 >> 24;
    var $548 = $49 << 24 >> 24 == 46;
    if ($548) {
      label = 205;
      break;
    } else {
      label = 206;
      break;
    }
   case 205:
    HEAP8[$8] = 38;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 206:
    var $_off846 = $49 - 48 & 255;
    var $551 = ($_off846 & 255) < 10;
    if ($551) {
      label = 208;
      break;
    } else {
      label = 207;
      break;
    }
   case 207:
    var $553 = HEAP8[$2];
    var $554 = $553 & -128;
    var $555 = $554 | 12;
    HEAP8[$2] = $555;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 208:
    var $557 = HEAP16[$39 >> 1];
    var $558 = $557 * 10 & -1;
    var $559 = $547 - 48 & 65535;
    var $560 = $559 + $558 & 65535;
    HEAP16[$39 >> 1] = $560;
    var $561 = ($560 & 65535) > 999;
    if ($561) {
      label = 209;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 209:
    var $563 = HEAP8[$2];
    var $564 = $563 & -128;
    var $565 = $564 | 12;
    HEAP8[$2] = $565;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 210:
    var $_off845 = $49 - 48 & 255;
    var $567 = ($_off845 & 255) < 10;
    if ($567) {
      label = 212;
      break;
    } else {
      label = 211;
      break;
    }
   case 211:
    var $569 = HEAP8[$2];
    var $570 = $569 & -128;
    var $571 = $570 | 12;
    HEAP8[$2] = $571;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 212:
    var $573 = $49 << 24 >> 24;
    var $574 = $573 - 48 & 65535;
    HEAP16[$40 >> 1] = $574;
    HEAP8[$8] = 39;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 213:
    var $576 = $49 << 24 >> 24;
    if ($49 << 24 >> 24 == 13) {
      label = 214;
      break;
    } else if ($49 << 24 >> 24 == 10) {
      label = 215;
      break;
    } else {
      label = 216;
      break;
    }
   case 214:
    HEAP8[$8] = 40;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 215:
    HEAP8[$8] = 41;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 216:
    var $_off844 = $49 - 48 & 255;
    var $580 = ($_off844 & 255) < 10;
    if ($580) {
      label = 218;
      break;
    } else {
      label = 217;
      break;
    }
   case 217:
    var $582 = HEAP8[$2];
    var $583 = $582 & -128;
    var $584 = $583 | 12;
    HEAP8[$2] = $584;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 218:
    var $586 = HEAP16[$40 >> 1];
    var $587 = $586 * 10 & -1;
    var $588 = $576 - 48 & 65535;
    var $589 = $588 + $587 & 65535;
    HEAP16[$40 >> 1] = $589;
    var $590 = ($589 & 65535) > 999;
    if ($590) {
      label = 219;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 219:
    var $592 = HEAP8[$2];
    var $593 = $592 & -128;
    var $594 = $593 | 12;
    HEAP8[$2] = $594;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 220:
    if ($54) {
      label = 222;
      break;
    } else {
      label = 221;
      break;
    }
   case 221:
    var $597 = HEAP8[$2];
    var $598 = $597 & -128;
    var $599 = $598 | 21;
    HEAP8[$2] = $599;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 222:
    HEAP8[$8] = 41;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 223:
    if ($49 << 24 >> 24 == 13) {
      label = 224;
      break;
    } else if ($49 << 24 >> 24 == 10) {
      label = 225;
      break;
    } else {
      label = 226;
      break;
    }
   case 224:
    HEAP8[$8] = 51;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 225:
    HEAP8[$8] = 51;
    var $body_mark_1_be = $body_mark_1;
    var $header_value_mark_2_be = $header_value_mark_2;
    var $p_1_be = $p_1;
    label = 28;
    break;
   case 226:
    var $605 = $49 & 255;
    var $606 = $605 + 5243136 | 0;
    var $607 = HEAP8[$606];
    var $608 = $607 << 24 >> 24 == 0;
    if ($608) {
      label = 227;
      break;
    } else {
      label = 228;
      break;
    }
   case 227:
    var $610 = HEAP8[$2];
    var $611 = $610 & -128;
    var $612 = $611 | 22;
    HEAP8[$2] = $612;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 228:
    var $614 = ($header_field_mark_11473 | 0) == 0;
    var $p_1_header_field_mark_1 = $614 ? $p_1 : $header_field_mark_11473;
    HEAP8[$38] = 0;
    HEAP8[$8] = 42;
    var $615 = $607 << 24 >> 24;
    if (($615 | 0) == 99) {
      label = 229;
      break;
    } else if (($615 | 0) == 112) {
      label = 230;
      break;
    } else if (($615 | 0) == 116) {
      label = 231;
      break;
    } else if (($615 | 0) == 117) {
      label = 232;
      break;
    } else {
      label = 233;
      break;
    }
   case 229:
    HEAP8[$44] = 1;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $p_1_header_field_mark_1;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 230:
    HEAP8[$44] = 5;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $p_1_header_field_mark_1;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 231:
    HEAP8[$44] = 7;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $p_1_header_field_mark_1;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 232:
    HEAP8[$44] = 8;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $p_1_header_field_mark_1;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 233:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $p_1_header_field_mark_1;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 234:
    var $622 = $49 & 255;
    var $623 = $622 + 5243136 | 0;
    var $624 = HEAP8[$623];
    var $625 = $624 << 24 >> 24 == 0;
    if ($625) {
      label = 270;
      break;
    } else {
      label = 235;
      break;
    }
   case 235:
    var $627 = HEAP8[$44];
    var $628 = $627 & 255;
    if (($628 | 0) == 1) {
      label = 236;
      break;
    } else if (($628 | 0) == 2) {
      label = 237;
      break;
    } else if (($628 | 0) == 3) {
      label = 238;
      break;
    } else if (($628 | 0) == 4) {
      label = 242;
      break;
    } else if (($628 | 0) == 5) {
      label = 247;
      break;
    } else if (($628 | 0) == 6) {
      label = 252;
      break;
    } else if (($628 | 0) == 7) {
      label = 257;
      break;
    } else if (($628 | 0) == 8) {
      label = 262;
      break;
    } else if (($628 | 0) == 9 | ($628 | 0) == 10 | ($628 | 0) == 11 | ($628 | 0) == 12) {
      label = 267;
      break;
    } else if (($628 | 0) == 0) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 269;
      break;
    }
   case 236:
    var $630 = HEAP8[$38];
    var $631 = $630 + 1 & 255;
    HEAP8[$38] = $631;
    var $632 = $49 << 24 >> 24 == 79;
    var $633 = $49 << 24 >> 24 == 111;
    var $634 = $632 | $633;
    var $635 = $634 ? 2 : 0;
    HEAP8[$44] = $635;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 237:
    var $637 = HEAP8[$38];
    var $638 = $637 + 1 & 255;
    HEAP8[$38] = $638;
    var $639 = $49 << 24 >> 24 == 78;
    var $640 = $49 << 24 >> 24 == 110;
    var $641 = $639 | $640;
    var $642 = $641 ? 3 : 0;
    HEAP8[$44] = $642;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 238:
    var $644 = HEAP8[$38];
    var $645 = $644 + 1 & 255;
    HEAP8[$38] = $645;
    var $646 = $624 << 24 >> 24;
    if (($646 | 0) == 110) {
      label = 239;
      break;
    } else if (($646 | 0) == 116) {
      label = 240;
      break;
    } else {
      label = 241;
      break;
    }
   case 239:
    HEAP8[$44] = 4;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 240:
    HEAP8[$44] = 6;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 241:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 242:
    var $651 = HEAP8[$38];
    var $652 = $651 + 1 & 255;
    HEAP8[$38] = $652;
    var $653 = ($652 & 255) > 10;
    if ($653) {
      label = 244;
      break;
    } else {
      label = 243;
      break;
    }
   case 243:
    var $655 = $652 & 255;
    var $656 = $655 + 5245600 | 0;
    var $657 = HEAP8[$656];
    var $658 = $624 << 24 >> 24 == $657 << 24 >> 24;
    if ($658) {
      label = 245;
      break;
    } else {
      label = 244;
      break;
    }
   case 244:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 245:
    var $661 = $652 << 24 >> 24 == 9;
    if ($661) {
      label = 246;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 246:
    HEAP8[$44] = 9;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 247:
    var $664 = HEAP8[$38];
    var $665 = $664 + 1 & 255;
    HEAP8[$38] = $665;
    var $666 = ($665 & 255) > 16;
    if ($666) {
      label = 249;
      break;
    } else {
      label = 248;
      break;
    }
   case 248:
    var $668 = $665 & 255;
    var $669 = $668 + 5245396 | 0;
    var $670 = HEAP8[$669];
    var $671 = $624 << 24 >> 24 == $670 << 24 >> 24;
    if ($671) {
      label = 250;
      break;
    } else {
      label = 249;
      break;
    }
   case 249:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 250:
    var $674 = $665 << 24 >> 24 == 15;
    if ($674) {
      label = 251;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 251:
    HEAP8[$44] = 9;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 252:
    var $677 = HEAP8[$38];
    var $678 = $677 + 1 & 255;
    HEAP8[$38] = $678;
    var $679 = ($678 & 255) > 14;
    if ($679) {
      label = 254;
      break;
    } else {
      label = 253;
      break;
    }
   case 253:
    var $681 = $678 & 255;
    var $682 = $681 + 5245100 | 0;
    var $683 = HEAP8[$682];
    var $684 = $624 << 24 >> 24 == $683 << 24 >> 24;
    if ($684) {
      label = 255;
      break;
    } else {
      label = 254;
      break;
    }
   case 254:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 255:
    var $687 = $678 << 24 >> 24 == 13;
    if ($687) {
      label = 256;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 256:
    HEAP8[$44] = 10;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 257:
    var $690 = HEAP8[$38];
    var $691 = $690 + 1 & 255;
    HEAP8[$38] = $691;
    var $692 = ($691 & 255) > 17;
    if ($692) {
      label = 259;
      break;
    } else {
      label = 258;
      break;
    }
   case 258:
    var $694 = $691 & 255;
    var $695 = $694 + 5244780 | 0;
    var $696 = HEAP8[$695];
    var $697 = $624 << 24 >> 24 == $696 << 24 >> 24;
    if ($697) {
      label = 260;
      break;
    } else {
      label = 259;
      break;
    }
   case 259:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 260:
    var $700 = $691 << 24 >> 24 == 16;
    if ($700) {
      label = 261;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 261:
    HEAP8[$44] = 11;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 262:
    var $703 = HEAP8[$38];
    var $704 = $703 + 1 & 255;
    HEAP8[$38] = $704;
    var $705 = ($704 & 255) > 7;
    if ($705) {
      label = 264;
      break;
    } else {
      label = 263;
      break;
    }
   case 263:
    var $707 = $704 & 255;
    var $708 = $707 + 5244596 | 0;
    var $709 = HEAP8[$708];
    var $710 = $624 << 24 >> 24 == $709 << 24 >> 24;
    if ($710) {
      label = 265;
      break;
    } else {
      label = 264;
      break;
    }
   case 264:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 265:
    var $713 = $704 << 24 >> 24 == 6;
    if ($713) {
      label = 266;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 266:
    HEAP8[$44] = 12;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 267:
    var $716 = $49 << 24 >> 24 == 32;
    if ($716) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 268;
      break;
    }
   case 268:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 269:
    ___assert_func(5246100, 1326, 5246600, 5244304);
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 270:
    if ($49 << 24 >> 24 == 58) {
      label = 271;
      break;
    } else if ($49 << 24 >> 24 == 13) {
      label = 279;
      break;
    } else if ($49 << 24 >> 24 == 10) {
      label = 287;
      break;
    } else {
      label = 295;
      break;
    }
   case 271:
    HEAP8[$8] = 43;
    var $721 = HEAP8[$2];
    var $722 = $721 & 127;
    var $723 = $722 << 24 >> 24 == 0;
    if ($723) {
      label = 273;
      break;
    } else {
      label = 272;
      break;
    }
   case 272:
    ___assert_func(5246100, 1334, 5246600, 5246064);
    label = 273;
    break;
   case 273:
    var $726 = ($header_field_mark_11473 | 0) == 0;
    if ($726) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 274;
      break;
    }
   case 274:
    var $728 = HEAP32[$45 >> 2];
    var $729 = ($728 | 0) == 0;
    if ($729) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 275;
      break;
    }
   case 275:
    var $731 = $p_1;
    var $732 = $header_field_mark_11473;
    var $733 = $731 - $732 | 0;
    var $734 = FUNCTION_TABLE[$728]($parser, $header_field_mark_11473, $733);
    var $735 = ($734 | 0) == 0;
    var $_pre64 = HEAP8[$2];
    if ($735) {
      var $739 = $_pre64;
      label = 277;
      break;
    } else {
      label = 276;
      break;
    }
   case 276:
    var $737 = $_pre64 & -128;
    var $738 = $737 | 4;
    HEAP8[$2] = $738;
    var $739 = $738;
    label = 277;
    break;
   case 277:
    var $739;
    var $740 = $739 & 127;
    var $741 = $740 << 24 >> 24 == 0;
    if ($741) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 278;
      break;
    }
   case 278:
    var $743 = $data;
    var $744 = 1 - $743 | 0;
    var $745 = $744 + $731 | 0;
    var $merge = $745;
    label = 8;
    break;
   case 279:
    HEAP8[$8] = 46;
    var $747 = HEAP8[$2];
    var $748 = $747 & 127;
    var $749 = $748 << 24 >> 24 == 0;
    if ($749) {
      label = 281;
      break;
    } else {
      label = 280;
      break;
    }
   case 280:
    ___assert_func(5246100, 1340, 5246600, 5246064);
    label = 281;
    break;
   case 281:
    var $752 = ($header_field_mark_11473 | 0) == 0;
    if ($752) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 282;
      break;
    }
   case 282:
    var $754 = HEAP32[$45 >> 2];
    var $755 = ($754 | 0) == 0;
    if ($755) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 283;
      break;
    }
   case 283:
    var $757 = $p_1;
    var $758 = $header_field_mark_11473;
    var $759 = $757 - $758 | 0;
    var $760 = FUNCTION_TABLE[$754]($parser, $header_field_mark_11473, $759);
    var $761 = ($760 | 0) == 0;
    var $_pre65 = HEAP8[$2];
    if ($761) {
      var $765 = $_pre65;
      label = 285;
      break;
    } else {
      label = 284;
      break;
    }
   case 284:
    var $763 = $_pre65 & -128;
    var $764 = $763 | 4;
    HEAP8[$2] = $764;
    var $765 = $764;
    label = 285;
    break;
   case 285:
    var $765;
    var $766 = $765 & 127;
    var $767 = $766 << 24 >> 24 == 0;
    if ($767) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 286;
      break;
    }
   case 286:
    var $769 = $data;
    var $770 = 1 - $769 | 0;
    var $771 = $770 + $757 | 0;
    var $merge = $771;
    label = 8;
    break;
   case 287:
    HEAP8[$8] = 41;
    var $773 = HEAP8[$2];
    var $774 = $773 & 127;
    var $775 = $774 << 24 >> 24 == 0;
    if ($775) {
      label = 289;
      break;
    } else {
      label = 288;
      break;
    }
   case 288:
    ___assert_func(5246100, 1346, 5246600, 5246064);
    label = 289;
    break;
   case 289:
    var $778 = ($header_field_mark_11473 | 0) == 0;
    if ($778) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 290;
      break;
    }
   case 290:
    var $780 = HEAP32[$45 >> 2];
    var $781 = ($780 | 0) == 0;
    if ($781) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 291;
      break;
    }
   case 291:
    var $783 = $p_1;
    var $784 = $header_field_mark_11473;
    var $785 = $783 - $784 | 0;
    var $786 = FUNCTION_TABLE[$780]($parser, $header_field_mark_11473, $785);
    var $787 = ($786 | 0) == 0;
    var $_pre66 = HEAP8[$2];
    if ($787) {
      var $791 = $_pre66;
      label = 293;
      break;
    } else {
      label = 292;
      break;
    }
   case 292:
    var $789 = $_pre66 & -128;
    var $790 = $789 | 4;
    HEAP8[$2] = $790;
    var $791 = $790;
    label = 293;
    break;
   case 293:
    var $791;
    var $792 = $791 & 127;
    var $793 = $792 << 24 >> 24 == 0;
    if ($793) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = 0;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 294;
      break;
    }
   case 294:
    var $795 = $data;
    var $796 = 1 - $795 | 0;
    var $797 = $796 + $783 | 0;
    var $merge = $797;
    label = 8;
    break;
   case 295:
    var $799 = HEAP8[$2];
    var $800 = $799 & -128;
    var $801 = $800 | 22;
    HEAP8[$2] = $801;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 296:
    if ($49 << 24 >> 24 == 32 | $49 << 24 >> 24 == 9) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 297;
      break;
    }
   case 297:
    var $804 = ($header_value_mark_2 | 0) == 0;
    var $p_1_header_value_mark_2 = $804 ? $p_1 : $header_value_mark_2;
    HEAP8[$8] = 44;
    HEAP8[$38] = 0;
    if ($49 << 24 >> 24 == 13) {
      label = 298;
      break;
    } else if ($49 << 24 >> 24 == 10) {
      label = 306;
      break;
    } else {
      label = 314;
      break;
    }
   case 298:
    HEAP8[$44] = 0;
    HEAP8[$8] = 46;
    var $806 = HEAP8[$2];
    var $807 = $806 & 127;
    var $808 = $807 << 24 >> 24 == 0;
    if ($808) {
      label = 300;
      break;
    } else {
      label = 299;
      break;
    }
   case 299:
    ___assert_func(5246100, 1366, 5246600, 5246064);
    label = 300;
    break;
   case 300:
    var $811 = ($p_1_header_value_mark_2 | 0) == 0;
    if ($811) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 301;
      break;
    }
   case 301:
    var $813 = HEAP32[$32 >> 2];
    var $814 = ($813 | 0) == 0;
    if ($814) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 302;
      break;
    }
   case 302:
    var $816 = $p_1;
    var $817 = $p_1_header_value_mark_2;
    var $818 = $816 - $817 | 0;
    var $819 = FUNCTION_TABLE[$813]($parser, $p_1_header_value_mark_2, $818);
    var $820 = ($819 | 0) == 0;
    var $_pre67 = HEAP8[$2];
    if ($820) {
      var $824 = $_pre67;
      label = 304;
      break;
    } else {
      label = 303;
      break;
    }
   case 303:
    var $822 = $_pre67 & -128;
    var $823 = $822 | 5;
    HEAP8[$2] = $823;
    var $824 = $823;
    label = 304;
    break;
   case 304:
    var $824;
    var $825 = $824 & 127;
    var $826 = $825 << 24 >> 24 == 0;
    if ($826) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 305;
      break;
    }
   case 305:
    var $828 = $data;
    var $829 = 1 - $828 | 0;
    var $830 = $829 + $816 | 0;
    var $merge = $830;
    label = 8;
    break;
   case 306:
    HEAP8[$8] = 41;
    var $832 = HEAP8[$2];
    var $833 = $832 & 127;
    var $834 = $833 << 24 >> 24 == 0;
    if ($834) {
      label = 308;
      break;
    } else {
      label = 307;
      break;
    }
   case 307:
    ___assert_func(5246100, 1372, 5246600, 5246064);
    label = 308;
    break;
   case 308:
    var $837 = ($p_1_header_value_mark_2 | 0) == 0;
    if ($837) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 309;
      break;
    }
   case 309:
    var $839 = HEAP32[$32 >> 2];
    var $840 = ($839 | 0) == 0;
    if ($840) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 310;
      break;
    }
   case 310:
    var $842 = $p_1;
    var $843 = $p_1_header_value_mark_2;
    var $844 = $842 - $843 | 0;
    var $845 = FUNCTION_TABLE[$839]($parser, $p_1_header_value_mark_2, $844);
    var $846 = ($845 | 0) == 0;
    var $_pre68 = HEAP8[$2];
    if ($846) {
      var $850 = $_pre68;
      label = 312;
      break;
    } else {
      label = 311;
      break;
    }
   case 311:
    var $848 = $_pre68 & -128;
    var $849 = $848 | 5;
    HEAP8[$2] = $849;
    var $850 = $849;
    label = 312;
    break;
   case 312:
    var $850;
    var $851 = $850 & 127;
    var $852 = $851 << 24 >> 24 == 0;
    if ($852) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 313;
      break;
    }
   case 313:
    var $854 = $data;
    var $855 = 1 - $854 | 0;
    var $856 = $855 + $842 | 0;
    var $merge = $856;
    label = 8;
    break;
   case 314:
    var $858 = $49 | 32;
    var $859 = HEAP8[$44];
    var $860 = $859 & 255;
    if (($860 | 0) == 12) {
      label = 315;
      break;
    } else if (($860 | 0) == 11) {
      label = 316;
      break;
    } else if (($860 | 0) == 10) {
      label = 319;
      break;
    } else if (($860 | 0) == 9) {
      label = 322;
      break;
    } else {
      label = 326;
      break;
    }
   case 315:
    var $862 = HEAP8[$1];
    var $863 = $862 | 64;
    HEAP8[$1] = $863;
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 316:
    var $865 = $858 << 24 >> 24 == 99;
    if ($865) {
      label = 317;
      break;
    } else {
      label = 318;
      break;
    }
   case 317:
    HEAP8[$44] = 13;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 318:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 319:
    var $_off843 = $49 - 48 & 255;
    var $869 = ($_off843 & 255) < 10;
    if ($869) {
      label = 321;
      break;
    } else {
      label = 320;
      break;
    }
   case 320:
    var $871 = HEAP8[$2];
    var $872 = $871 & -128;
    var $873 = $872 | 23;
    HEAP8[$2] = $873;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 321:
    var $875 = $53 - 48 | 0;
    var $876$0 = $875;
    var $876$1 = ($875 | 0) < 0 ? -1 : 0;
    var $st$3$0 = $31 | 0;
    HEAP32[$st$3$0 >> 2] = $876$0;
    var $st$3$1 = $31 + 4 | 0;
    HEAP32[$st$3$1 >> 2] = $876$1;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 322:
    if ($858 << 24 >> 24 == 107) {
      label = 323;
      break;
    } else if ($858 << 24 >> 24 == 99) {
      label = 324;
      break;
    } else {
      label = 325;
      break;
    }
   case 323:
    HEAP8[$44] = 14;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 324:
    HEAP8[$44] = 15;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 325:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 326:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $p_1_header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 327:
    if ($49 << 24 >> 24 == 13) {
      label = 328;
      break;
    } else if ($49 << 24 >> 24 == 10) {
      label = 336;
      break;
    } else {
      label = 344;
      break;
    }
   case 328:
    HEAP8[$8] = 46;
    var $884 = HEAP8[$2];
    var $885 = $884 & 127;
    var $886 = $885 << 24 >> 24 == 0;
    if ($886) {
      label = 330;
      break;
    } else {
      label = 329;
      break;
    }
   case 329:
    ___assert_func(5246100, 1426, 5246600, 5246064);
    label = 330;
    break;
   case 330:
    var $889 = ($header_value_mark_2 | 0) == 0;
    if ($889) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 331;
      break;
    }
   case 331:
    var $891 = HEAP32[$32 >> 2];
    var $892 = ($891 | 0) == 0;
    if ($892) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 332;
      break;
    }
   case 332:
    var $894 = $p_1;
    var $895 = $header_value_mark_2;
    var $896 = $894 - $895 | 0;
    var $897 = FUNCTION_TABLE[$891]($parser, $header_value_mark_2, $896);
    var $898 = ($897 | 0) == 0;
    var $_pre69 = HEAP8[$2];
    if ($898) {
      var $902 = $_pre69;
      label = 334;
      break;
    } else {
      label = 333;
      break;
    }
   case 333:
    var $900 = $_pre69 & -128;
    var $901 = $900 | 5;
    HEAP8[$2] = $901;
    var $902 = $901;
    label = 334;
    break;
   case 334:
    var $902;
    var $903 = $902 & 127;
    var $904 = $903 << 24 >> 24 == 0;
    if ($904) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = 0;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 335;
      break;
    }
   case 335:
    var $906 = $data;
    var $907 = 1 - $906 | 0;
    var $908 = $907 + $894 | 0;
    var $merge = $908;
    label = 8;
    break;
   case 336:
    HEAP8[$8] = 46;
    var $910 = HEAP8[$2];
    var $911 = $910 & 127;
    var $912 = $911 << 24 >> 24 == 0;
    if ($912) {
      label = 338;
      break;
    } else {
      label = 337;
      break;
    }
   case 337:
    ___assert_func(5246100, 1432, 5246600, 5246064);
    label = 338;
    break;
   case 338:
    var $915 = ($header_value_mark_2 | 0) == 0;
    if ($915) {
      var $body_mark_1_be = $body_mark_1;
      var $header_value_mark_2_be = 0;
      var $p_1_be = $p_1;
      label = 28;
      break;
    } else {
      label = 339;
      break;
    }
   case 339:
    var $917 = HEAP32[$32 >> 2];
    var $918 = ($917 | 0) == 0;
    if ($918) {
      var $body_mark_1_be = $body_mark_1;
      var $header_value_mark_2_be = 0;
      var $p_1_be = $p_1;
      label = 28;
      break;
    } else {
      label = 340;
      break;
    }
   case 340:
    var $920 = $p_1;
    var $921 = $header_value_mark_2;
    var $922 = $920 - $921 | 0;
    var $923 = FUNCTION_TABLE[$917]($parser, $header_value_mark_2, $922);
    var $924 = ($923 | 0) == 0;
    var $_pre70 = HEAP8[$2];
    if ($924) {
      var $928 = $_pre70;
      label = 342;
      break;
    } else {
      label = 341;
      break;
    }
   case 341:
    var $926 = $_pre70 & -128;
    var $927 = $926 | 5;
    HEAP8[$2] = $927;
    var $928 = $927;
    label = 342;
    break;
   case 342:
    var $928;
    var $929 = $928 & 127;
    var $930 = $929 << 24 >> 24 == 0;
    if ($930) {
      var $body_mark_1_be = $body_mark_1;
      var $header_value_mark_2_be = 0;
      var $p_1_be = $p_1;
      label = 28;
      break;
    } else {
      label = 343;
      break;
    }
   case 343:
    var $932 = $data;
    var $933 = $920 - $932 | 0;
    var $merge = $933;
    label = 8;
    break;
   case 344:
    var $935 = $49 | 32;
    var $936 = HEAP8[$44];
    var $937 = $936 & 255;
    if (($937 | 0) == 9 | ($937 | 0) == 11) {
      label = 345;
      break;
    } else if (($937 | 0) == 10) {
      label = 346;
      break;
    } else if (($937 | 0) == 13) {
      label = 352;
      break;
    } else if (($937 | 0) == 14) {
      label = 357;
      break;
    } else if (($937 | 0) == 15) {
      label = 362;
      break;
    } else if (($937 | 0) == 16 | ($937 | 0) == 17 | ($937 | 0) == 18) {
      label = 367;
      break;
    } else if (($937 | 0) == 0) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 369;
      break;
    }
   case 345:
    ___assert_func(5246100, 1444, 5246600, 5244020);
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 346:
    var $940 = $49 << 24 >> 24 == 32;
    if ($940) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 347;
      break;
    }
   case 347:
    var $_off842 = $49 - 48 & 255;
    var $942 = ($_off842 & 255) < 10;
    if ($942) {
      label = 349;
      break;
    } else {
      label = 348;
      break;
    }
   case 348:
    var $944 = HEAP8[$2];
    var $945 = $944 & -128;
    var $946 = $945 | 23;
    HEAP8[$2] = $946;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 349:
    var $st$0$0 = $31 | 0;
    var $948$0 = HEAP32[$st$0$0 >> 2];
    var $st$0$1 = $31 + 4 | 0;
    var $948$1 = HEAP32[$st$0$1 >> 2];
    var $$etemp$3$0 = 10;
    var $$etemp$3$1 = 0;
    var $949$0 = (i64Math.multiply($948$0, $948$1, $$etemp$3$0, $$etemp$3$1), HEAP32[tempDoublePtr >> 2]);
    var $949$1 = HEAP32[tempDoublePtr + 4 >> 2];
    var $950 = $53 - 48 | 0;
    var $951$0 = $950;
    var $951$1 = ($950 | 0) < 0 ? -1 : 0;
    var $952$0 = (i64Math.add($949$0, $949$1, $951$0, $951$1), HEAP32[tempDoublePtr >> 2]);
    var $952$1 = HEAP32[tempDoublePtr + 4 >> 2];
    var $953 = $952$1 >>> 0 < $948$1 >>> 0 | $952$1 >>> 0 == $948$1 >>> 0 & $952$0 >>> 0 < $948$0 >>> 0;
    var $$etemp$4$0 = -1;
    var $$etemp$4$1 = -1;
    var $954 = ($952$0 | 0) == ($$etemp$4$0 | 0) & ($952$1 | 0) == ($$etemp$4$1 | 0);
    var $or_cond = $953 | $954;
    if ($or_cond) {
      label = 350;
      break;
    } else {
      label = 351;
      break;
    }
   case 350:
    var $956 = HEAP8[$2];
    var $957 = $956 & -128;
    var $958 = $957 | 23;
    HEAP8[$2] = $958;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 351:
    var $st$0$0 = $31 | 0;
    HEAP32[$st$0$0 >> 2] = $952$0;
    var $st$0$1 = $31 + 4 | 0;
    HEAP32[$st$0$1 >> 2] = $952$1;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 352:
    var $961 = HEAP8[$38];
    var $962 = $961 + 1 & 255;
    HEAP8[$38] = $962;
    var $963 = ($962 & 255) > 7;
    if ($963) {
      label = 354;
      break;
    } else {
      label = 353;
      break;
    }
   case 353:
    var $965 = $962 & 255;
    var $966 = $965 + 5243916 | 0;
    var $967 = HEAP8[$966];
    var $968 = $935 << 24 >> 24 == $967 << 24 >> 24;
    if ($968) {
      label = 355;
      break;
    } else {
      label = 354;
      break;
    }
   case 354:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 355:
    var $971 = $962 << 24 >> 24 == 6;
    if ($971) {
      label = 356;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 356:
    HEAP8[$44] = 16;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 357:
    var $974 = HEAP8[$38];
    var $975 = $974 + 1 & 255;
    HEAP8[$38] = $975;
    var $976 = ($975 & 255) > 10;
    if ($976) {
      label = 359;
      break;
    } else {
      label = 358;
      break;
    }
   case 358:
    var $978 = $975 & 255;
    var $979 = $978 + 5246052 | 0;
    var $980 = HEAP8[$979];
    var $981 = $935 << 24 >> 24 == $980 << 24 >> 24;
    if ($981) {
      label = 360;
      break;
    } else {
      label = 359;
      break;
    }
   case 359:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 360:
    var $984 = $975 << 24 >> 24 == 9;
    if ($984) {
      label = 361;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 361:
    HEAP8[$44] = 17;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 362:
    var $987 = HEAP8[$38];
    var $988 = $987 + 1 & 255;
    HEAP8[$38] = $988;
    var $989 = ($988 & 255) > 5;
    if ($989) {
      label = 364;
      break;
    } else {
      label = 363;
      break;
    }
   case 363:
    var $991 = $988 & 255;
    var $992 = $991 + 5245964 | 0;
    var $993 = HEAP8[$992];
    var $994 = $935 << 24 >> 24 == $993 << 24 >> 24;
    if ($994) {
      label = 365;
      break;
    } else {
      label = 364;
      break;
    }
   case 364:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 365:
    var $997 = $988 << 24 >> 24 == 4;
    if ($997) {
      label = 366;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 366:
    HEAP8[$44] = 18;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 367:
    var $1000 = $49 << 24 >> 24 == 32;
    if ($1000) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 368;
      break;
    }
   case 368:
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 369:
    HEAP8[$8] = 44;
    HEAP8[$44] = 0;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 370:
    if ($54) {
      label = 372;
      break;
    } else {
      label = 371;
      break;
    }
   case 371:
    var $1005 = HEAP8[$2];
    var $1006 = $1005 & -128;
    var $1007 = $1006 | 27;
    HEAP8[$2] = $1007;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 372:
    HEAP8[$8] = 45;
    var $1009 = HEAP8[$44];
    var $1010 = $1009 & 255;
    if (($1010 | 0) == 17) {
      label = 373;
      break;
    } else if (($1010 | 0) == 18) {
      label = 374;
      break;
    } else if (($1010 | 0) == 16) {
      label = 375;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 373:
    var $1012 = HEAP8[$1];
    var $1013 = $1012 | 8;
    HEAP8[$1] = $1013;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 374:
    var $1015 = HEAP8[$1];
    var $1016 = $1015 | 16;
    HEAP8[$1] = $1016;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 375:
    var $1018 = HEAP8[$1];
    var $1019 = $1018 | 4;
    HEAP8[$1] = $1019;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 376:
    if ($49 << 24 >> 24 == 32 | $49 << 24 >> 24 == 9) {
      label = 377;
      break;
    } else {
      label = 378;
      break;
    }
   case 377:
    HEAP8[$8] = 43;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 378:
    HEAP8[$8] = 41;
    var $body_mark_1_be = $body_mark_1;
    var $header_value_mark_2_be = $header_value_mark_2;
    var $p_1_be = $p_1;
    label = 28;
    break;
   case 379:
    if ($54) {
      label = 381;
      break;
    } else {
      label = 380;
      break;
    }
   case 380:
    var $1025 = HEAP8[$2];
    var $1026 = $1025 & -128;
    var $1027 = $1026 | 27;
    HEAP8[$2] = $1027;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 381:
    var $1029 = HEAP8[$1];
    var $1030 = $1029 & 32;
    var $1031 = $1030 << 24 >> 24 == 0;
    if ($1031) {
      label = 391;
      break;
    } else {
      label = 382;
      break;
    }
   case 382:
    var $1033 = _http_should_keep_alive($parser);
    var $1034 = ($1033 | 0) == 0;
    if ($1034) {
      var $1038 = 1;
      label = 384;
      break;
    } else {
      label = 383;
      break;
    }
   case 383:
    var $1036 = $1029 & 3;
    var $1037 = $1036 << 24 >> 24 == 0;
    var $phitmp815 = $1037 ? 17 : 4;
    var $1038 = $phitmp815;
    label = 384;
    break;
   case 384:
    var $1038;
    HEAP8[$8] = $1038;
    var $1039 = HEAP8[$2];
    var $1040 = $1039 & 127;
    var $1041 = $1040 << 24 >> 24 == 0;
    if ($1041) {
      label = 386;
      break;
    } else {
      label = 385;
      break;
    }
   case 385:
    ___assert_func(5246100, 1560, 5246600, 5246064);
    label = 386;
    break;
   case 386:
    var $1044 = HEAP32[$46 >> 2];
    var $1045 = ($1044 | 0) == 0;
    if ($1045) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 387;
      break;
    }
   case 387:
    var $1047 = FUNCTION_TABLE[$1044]($parser);
    var $1048 = ($1047 | 0) == 0;
    var $_pre71 = HEAP8[$2];
    if ($1048) {
      var $1052 = $_pre71;
      label = 389;
      break;
    } else {
      label = 388;
      break;
    }
   case 388:
    var $1050 = $_pre71 & -128;
    var $1051 = $1050 | 8;
    HEAP8[$2] = $1051;
    var $1052 = $1051;
    label = 389;
    break;
   case 389:
    var $1052;
    var $1053 = $1052 & 127;
    var $1054 = $1053 << 24 >> 24 == 0;
    if ($1054) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 390;
      break;
    }
   case 390:
    var $1056 = $p_1;
    var $1057 = $data;
    var $1058 = 1 - $1057 | 0;
    var $1059 = $1058 + $1056 | 0;
    var $merge = $1059;
    label = 8;
    break;
   case 391:
    HEAP8[$8] = 52;
    var $1061 = $parser;
    var $1062 = HEAP16[$1061 >> 1];
    var $1063 = $1062 & 64;
    var $1064 = $1063 << 16 >> 16 == 0;
    if ($1064) {
      label = 392;
      break;
    } else {
      var $1068 = 1;
      label = 393;
      break;
    }
   case 392:
    var $1066 = HEAP8[$33];
    var $1067 = $1066 << 24 >> 24 == 5;
    var $1068 = $1067;
    label = 393;
    break;
   case 393:
    var $1068;
    var $1069 = $1068 & 1;
    var $1070 = $1069 << 7;
    var $1071 = HEAP8[$2];
    var $1072 = $1071 & 127;
    var $1073 = $1072 | $1070;
    HEAP8[$2] = $1073;
    var $1074 = HEAP32[$34 >> 2];
    var $1075 = ($1074 | 0) == 0;
    if ($1075) {
      label = 397;
      break;
    } else {
      label = 394;
      break;
    }
   case 394:
    var $1077 = FUNCTION_TABLE[$1074]($parser);
    if (($1077 | 0) == 1) {
      label = 395;
      break;
    } else if (($1077 | 0) == 0) {
      label = 397;
      break;
    } else {
      label = 396;
      break;
    }
   case 395:
    var $1079 = HEAP16[$1061 >> 1];
    var $1080 = $1079 & 255;
    var $1081 = $1080 | -128;
    HEAP8[$1] = $1081;
    label = 397;
    break;
   case 396:
    var $1083 = HEAP8[$2];
    var $1084 = $1083 & -128;
    var $1085 = $1084 | 6;
    HEAP8[$2] = $1085;
    var $1086 = $p_1;
    var $1087 = $data;
    var $1088 = $1086 - $1087 | 0;
    var $merge = $1088;
    label = 8;
    break;
   case 397:
    var $1089 = HEAP8[$2];
    var $1090 = $1089 & 127;
    var $1091 = $1090 << 24 >> 24 == 0;
    if ($1091) {
      var $body_mark_1_be = $body_mark_1;
      var $header_value_mark_2_be = $header_value_mark_2;
      var $p_1_be = $p_1;
      label = 28;
      break;
    } else {
      label = 398;
      break;
    }
   case 398:
    var $1093 = $p_1;
    var $1094 = $data;
    var $1095 = $1093 - $1094 | 0;
    var $merge = $1095;
    label = 8;
    break;
   case 399:
    if ($54) {
      label = 401;
      break;
    } else {
      label = 400;
      break;
    }
   case 400:
    var $1098 = HEAP8[$2];
    var $1099 = $1098 & -128;
    var $1100 = $1099 | 27;
    HEAP8[$2] = $1100;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 401:
    HEAP32[$30 >> 2] = 0;
    var $1102 = HEAP8[$2];
    var $1103 = $1102 << 24 >> 24 < 0;
    if ($1103) {
      label = 402;
      break;
    } else {
      label = 412;
      break;
    }
   case 402:
    var $1105 = _http_should_keep_alive($parser);
    var $1106 = ($1105 | 0) == 0;
    if ($1106) {
      var $1112 = 1;
      label = 404;
      break;
    } else {
      label = 403;
      break;
    }
   case 403:
    var $1108 = HEAP8[$1];
    var $1109 = $1108 & 3;
    var $1110 = $1109 << 24 >> 24 == 0;
    var $phitmp814 = $1110 ? 17 : 4;
    var $1112 = $phitmp814;
    label = 404;
    break;
   case 404:
    var $1112;
    HEAP8[$8] = $1112;
    var $1113 = $1102 & 127;
    var $1114 = $1113 << 24 >> 24 == 0;
    if ($1114) {
      label = 406;
      break;
    } else {
      label = 405;
      break;
    }
   case 405:
    ___assert_func(5246100, 1610, 5246600, 5246064);
    label = 406;
    break;
   case 406:
    var $1117 = HEAP32[$46 >> 2];
    var $1118 = ($1117 | 0) == 0;
    if ($1118) {
      label = 411;
      break;
    } else {
      label = 407;
      break;
    }
   case 407:
    var $1120 = FUNCTION_TABLE[$1117]($parser);
    var $1121 = ($1120 | 0) == 0;
    var $_pre72 = HEAP8[$2];
    if ($1121) {
      var $1125 = $_pre72;
      label = 409;
      break;
    } else {
      label = 408;
      break;
    }
   case 408:
    var $1123 = $_pre72 & -128;
    var $1124 = $1123 | 8;
    HEAP8[$2] = $1124;
    var $1125 = $1124;
    label = 409;
    break;
   case 409:
    var $1125;
    var $1126 = $1125 & 127;
    var $1127 = $1126 << 24 >> 24 == 0;
    if ($1127) {
      label = 411;
      break;
    } else {
      label = 410;
      break;
    }
   case 410:
    var $1129 = $p_1;
    var $1130 = $data;
    var $1131 = 1 - $1130 | 0;
    var $1132 = $1131 + $1129 | 0;
    var $merge = $1132;
    label = 8;
    break;
   case 411:
    var $1134 = $p_1;
    var $1135 = $data;
    var $1136 = 1 - $1135 | 0;
    var $1137 = $1136 + $1134 | 0;
    var $merge = $1137;
    label = 8;
    break;
   case 412:
    var $1139 = HEAP8[$1];
    var $1140 = ($1139 & 255) >>> 2;
    var $1141 = $1140 & 255;
    var $1142 = $1141 & 32;
    var $1143 = ($1142 | 0) == 0;
    if ($1143) {
      label = 422;
      break;
    } else {
      label = 413;
      break;
    }
   case 413:
    var $1145 = _http_should_keep_alive($parser);
    var $1146 = ($1145 | 0) == 0;
    if ($1146) {
      var $1151 = 1;
      label = 415;
      break;
    } else {
      label = 414;
      break;
    }
   case 414:
    var $1148 = $1139 & 3;
    var $1149 = $1148 << 24 >> 24 == 0;
    var $phitmp813 = $1149 ? 17 : 4;
    var $1151 = $phitmp813;
    label = 415;
    break;
   case 415:
    var $1151;
    HEAP8[$8] = $1151;
    var $1152 = $1102 & 127;
    var $1153 = $1152 << 24 >> 24 == 0;
    if ($1153) {
      label = 417;
      break;
    } else {
      label = 416;
      break;
    }
   case 416:
    ___assert_func(5246100, 1616, 5246600, 5246064);
    label = 417;
    break;
   case 417:
    var $1156 = HEAP32[$46 >> 2];
    var $1157 = ($1156 | 0) == 0;
    if ($1157) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 418;
      break;
    }
   case 418:
    var $1159 = FUNCTION_TABLE[$1156]($parser);
    var $1160 = ($1159 | 0) == 0;
    var $_pre75 = HEAP8[$2];
    if ($1160) {
      var $1164 = $_pre75;
      label = 420;
      break;
    } else {
      label = 419;
      break;
    }
   case 419:
    var $1162 = $_pre75 & -128;
    var $1163 = $1162 | 8;
    HEAP8[$2] = $1163;
    var $1164 = $1163;
    label = 420;
    break;
   case 420:
    var $1164;
    var $1165 = $1164 & 127;
    var $1166 = $1165 << 24 >> 24 == 0;
    if ($1166) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 421;
      break;
    }
   case 421:
    var $1168 = $p_1;
    var $1169 = $data;
    var $1170 = 1 - $1169 | 0;
    var $1171 = $1170 + $1168 | 0;
    var $merge = $1171;
    label = 8;
    break;
   case 422:
    var $1173 = $1141 & 1;
    var $1174 = ($1173 | 0) == 0;
    if ($1174) {
      label = 424;
      break;
    } else {
      label = 423;
      break;
    }
   case 423:
    HEAP8[$8] = 47;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 424:
    var $st$0$0 = $31 | 0;
    var $1177$0 = HEAP32[$st$0$0 >> 2];
    var $st$0$1 = $31 + 4 | 0;
    var $1177$1 = HEAP32[$st$0$1 >> 2];
    var $$etemp$6$0 = -1;
    var $$etemp$6$1 = -1;
    var $$etemp$5$0 = 0;
    var $$etemp$5$1 = 0;
    if ($1177$0 == $$etemp$5$0 & $1177$1 == $$etemp$5$1) {
      label = 425;
      break;
    } else if ($1177$0 == $$etemp$6$0 & $1177$1 == $$etemp$6$1) {
      label = 435;
      break;
    } else {
      label = 434;
      break;
    }
   case 425:
    var $1179 = _http_should_keep_alive($parser);
    var $1180 = ($1179 | 0) == 0;
    if ($1180) {
      var $1185 = 1;
      label = 427;
      break;
    } else {
      label = 426;
      break;
    }
   case 426:
    var $1182 = $1139 & 3;
    var $1183 = $1182 << 24 >> 24 == 0;
    var $phitmp812 = $1183 ? 17 : 4;
    var $1185 = $phitmp812;
    label = 427;
    break;
   case 427:
    var $1185;
    HEAP8[$8] = $1185;
    var $1186 = $1102 & 127;
    var $1187 = $1186 << 24 >> 24 == 0;
    if ($1187) {
      label = 429;
      break;
    } else {
      label = 428;
      break;
    }
   case 428:
    ___assert_func(5246100, 1624, 5246600, 5246064);
    label = 429;
    break;
   case 429:
    var $1190 = HEAP32[$46 >> 2];
    var $1191 = ($1190 | 0) == 0;
    if ($1191) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 430;
      break;
    }
   case 430:
    var $1193 = FUNCTION_TABLE[$1190]($parser);
    var $1194 = ($1193 | 0) == 0;
    var $_pre73 = HEAP8[$2];
    if ($1194) {
      var $1198 = $_pre73;
      label = 432;
      break;
    } else {
      label = 431;
      break;
    }
   case 431:
    var $1196 = $_pre73 & -128;
    var $1197 = $1196 | 8;
    HEAP8[$2] = $1197;
    var $1198 = $1197;
    label = 432;
    break;
   case 432:
    var $1198;
    var $1199 = $1198 & 127;
    var $1200 = $1199 << 24 >> 24 == 0;
    if ($1200) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 433;
      break;
    }
   case 433:
    var $1202 = $p_1;
    var $1203 = $data;
    var $1204 = 1 - $1203 | 0;
    var $1205 = $1204 + $1202 | 0;
    var $merge = $1205;
    label = 8;
    break;
   case 434:
    HEAP8[$8] = 56;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 435:
    var $1208 = $1139 & 3;
    var $1209 = $1208 << 24 >> 24 == 0;
    if ($1209) {
      label = 437;
      break;
    } else {
      label = 436;
      break;
    }
   case 436:
    var $1211 = _http_message_needs_eof($parser);
    var $1212 = ($1211 | 0) == 0;
    if ($1212) {
      label = 437;
      break;
    } else {
      label = 446;
      break;
    }
   case 437:
    var $1214 = _http_should_keep_alive($parser);
    var $1215 = ($1214 | 0) == 0;
    if ($1215) {
      var $1218 = 1;
      label = 439;
      break;
    } else {
      label = 438;
      break;
    }
   case 438:
    var $phitmp811 = $1209 ? 17 : 4;
    var $1218 = $phitmp811;
    label = 439;
    break;
   case 439:
    var $1218;
    HEAP8[$8] = $1218;
    var $1219 = $1102 & 127;
    var $1220 = $1219 << 24 >> 24 == 0;
    if ($1220) {
      label = 441;
      break;
    } else {
      label = 440;
      break;
    }
   case 440:
    ___assert_func(5246100, 1633, 5246600, 5246064);
    label = 441;
    break;
   case 441:
    var $1223 = HEAP32[$46 >> 2];
    var $1224 = ($1223 | 0) == 0;
    if ($1224) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 442;
      break;
    }
   case 442:
    var $1226 = FUNCTION_TABLE[$1223]($parser);
    var $1227 = ($1226 | 0) == 0;
    var $_pre74 = HEAP8[$2];
    if ($1227) {
      var $1231 = $_pre74;
      label = 444;
      break;
    } else {
      label = 443;
      break;
    }
   case 443:
    var $1229 = $_pre74 & -128;
    var $1230 = $1229 | 8;
    HEAP8[$2] = $1230;
    var $1231 = $1230;
    label = 444;
    break;
   case 444:
    var $1231;
    var $1232 = $1231 & 127;
    var $1233 = $1232 << 24 >> 24 == 0;
    if ($1233) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 445;
      break;
    }
   case 445:
    var $1235 = $p_1;
    var $1236 = $data;
    var $1237 = 1 - $1236 | 0;
    var $1238 = $1237 + $1235 | 0;
    var $merge = $1238;
    label = 8;
    break;
   case 446:
    HEAP8[$8] = 57;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 447:
    var $st$0$0 = $31 | 0;
    var $1241$0 = HEAP32[$st$0$0 >> 2];
    var $st$0$1 = $31 + 4 | 0;
    var $1241$1 = HEAP32[$st$0$1 >> 2];
    var $1242 = $p_1;
    var $1243 = $35 - $1242 | 0;
    var $1244$0 = $1243;
    var $1244$1 = ($1243 | 0) < 0 ? -1 : 0;
    var $1245 = $1241$1 >>> 0 < $1244$1 >>> 0 | $1241$1 >>> 0 == $1244$1 >>> 0 & $1241$0 >>> 0 < $1244$0 >>> 0;
    var $_$0 = $1245 ? $1241$0 : $1244$0;
    var $_$1 = $1245 ? $1241$1 : $1244$1;
    var $$etemp$8$0 = -1;
    var $$etemp$8$1 = -1;
    var $$etemp$7$0 = 0;
    var $$etemp$7$1 = 0;
    if ($1241$0 == $$etemp$7$0 & $1241$1 == $$etemp$7$1 | $1241$0 == $$etemp$8$0 & $1241$1 == $$etemp$8$1) {
      label = 448;
      break;
    } else {
      var $1248$1 = $1241$1;
      var $1248$0 = $1241$0;
      label = 449;
      break;
    }
   case 448:
    ___assert_func(5246100, 1650, 5246600, 5245896);
    var $st$1$0 = $31 | 0;
    var $_pre3$0 = HEAP32[$st$1$0 >> 2];
    var $st$1$1 = $31 + 4 | 0;
    var $_pre3$1 = HEAP32[$st$1$1 >> 2];
    var $1248$1 = $_pre3$1;
    var $1248$0 = $_pre3$0;
    label = 449;
    break;
   case 449:
    var $1248$0;
    var $1248$1;
    var $1249 = ($body_mark_1 | 0) == 0;
    var $p_1_body_mark_1 = $1249 ? $p_1 : $body_mark_1;
    var $1250$0 = (i64Math.subtract($1248$0, $1248$1, $_$0, $_$1), HEAP32[tempDoublePtr >> 2]);
    var $1250$1 = HEAP32[tempDoublePtr + 4 >> 2];
    var $st$5$0 = $31 | 0;
    HEAP32[$st$5$0 >> 2] = $1250$0;
    var $st$5$1 = $31 + 4 | 0;
    HEAP32[$st$5$1 >> 2] = $1250$1;
    var $$etemp$9$0 = -1;
    var $$etemp$9$1 = 0;
    var $1251$0 = (i64Math.add($_$0, $_$1, $$etemp$9$0, $$etemp$9$1), HEAP32[tempDoublePtr >> 2]);
    var $1252$0 = $1251$0;
    var $1252 = $1252$0;
    var $1253 = $p_1 + $1252 | 0;
    var $1254 = ($1248$0 | 0) == ($_$0 | 0) & ($1248$1 | 0) == ($_$1 | 0);
    if ($1254) {
      label = 450;
      break;
    } else {
      var $body_mark_5 = $p_1_body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $1253;
      label = 523;
      break;
    }
   case 450:
    HEAP8[$8] = 58;
    var $1256 = HEAP8[$2];
    var $1257 = $1256 & 127;
    var $1258 = $1257 << 24 >> 24 == 0;
    if ($1258) {
      label = 452;
      break;
    } else {
      label = 451;
      break;
    }
   case 451:
    ___assert_func(5246100, 1673, 5246600, 5246064);
    label = 452;
    break;
   case 452:
    var $1261 = ($p_1_body_mark_1 | 0) == 0;
    if ($1261) {
      var $body_mark_1_be = 0;
      var $header_value_mark_2_be = $header_value_mark_2;
      var $p_1_be = $1253;
      label = 28;
      break;
    } else {
      label = 453;
      break;
    }
   case 453:
    var $1263 = HEAP32[$36 >> 2];
    var $1264 = ($1263 | 0) == 0;
    if ($1264) {
      var $body_mark_1_be = 0;
      var $header_value_mark_2_be = $header_value_mark_2;
      var $p_1_be = $1253;
      label = 28;
      break;
    } else {
      label = 454;
      break;
    }
   case 454:
    var $1266 = $1253;
    var $1267 = $p_1_body_mark_1;
    var $1268 = 1 - $1267 | 0;
    var $1269 = $1268 + $1266 | 0;
    var $1270 = FUNCTION_TABLE[$1263]($parser, $p_1_body_mark_1, $1269);
    var $1271 = ($1270 | 0) == 0;
    var $_pre76 = HEAP8[$2];
    if ($1271) {
      var $1275 = $_pre76;
      label = 456;
      break;
    } else {
      label = 455;
      break;
    }
   case 455:
    var $1273 = $_pre76 & -128;
    var $1274 = $1273 | 7;
    HEAP8[$2] = $1274;
    var $1275 = $1274;
    label = 456;
    break;
   case 456:
    var $1275;
    var $1276 = $1275 & 127;
    var $1277 = $1276 << 24 >> 24 == 0;
    if ($1277) {
      var $body_mark_1_be = 0;
      var $header_value_mark_2_be = $header_value_mark_2;
      var $p_1_be = $1253;
      label = 28;
      break;
    } else {
      label = 457;
      break;
    }
   case 457:
    var $1279 = $data;
    var $1280 = $1266 - $1279 | 0;
    var $merge = $1280;
    label = 8;
    break;
   case 458:
    var $1282 = ($body_mark_1 | 0) == 0;
    var $p_1_body_mark_1839 = $1282 ? $p_1 : $body_mark_1;
    var $body_mark_5 = $p_1_body_mark_1839;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $47;
    label = 523;
    break;
   case 459:
    var $1284 = _http_should_keep_alive($parser);
    var $1285 = ($1284 | 0) == 0;
    if ($1285) {
      var $1290 = 1;
      label = 461;
      break;
    } else {
      label = 460;
      break;
    }
   case 460:
    var $1287 = HEAP8[$1];
    var $1288 = $1287 & 3;
    var $1289 = $1288 << 24 >> 24 == 0;
    var $phitmp = $1289 ? 17 : 4;
    var $1290 = $phitmp;
    label = 461;
    break;
   case 461:
    var $1290;
    HEAP8[$8] = $1290;
    var $1291 = HEAP8[$2];
    var $1292 = $1291 & 127;
    var $1293 = $1292 << 24 >> 24 == 0;
    if ($1293) {
      label = 463;
      break;
    } else {
      label = 462;
      break;
    }
   case 462:
    ___assert_func(5246100, 1689, 5246600, 5246064);
    label = 463;
    break;
   case 463:
    var $1296 = HEAP32[$46 >> 2];
    var $1297 = ($1296 | 0) == 0;
    if ($1297) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 464;
      break;
    }
   case 464:
    var $1299 = FUNCTION_TABLE[$1296]($parser);
    var $1300 = ($1299 | 0) == 0;
    var $_pre77 = HEAP8[$2];
    if ($1300) {
      var $1304 = $_pre77;
      label = 466;
      break;
    } else {
      label = 465;
      break;
    }
   case 465:
    var $1302 = $_pre77 & -128;
    var $1303 = $1302 | 8;
    HEAP8[$2] = $1303;
    var $1304 = $1303;
    label = 466;
    break;
   case 466:
    var $1304;
    var $1305 = $1304 & 127;
    var $1306 = $1305 << 24 >> 24 == 0;
    if ($1306) {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 467;
      break;
    }
   case 467:
    var $1308 = $p_1;
    var $1309 = $data;
    var $1310 = 1 - $1309 | 0;
    var $1311 = $1310 + $1308 | 0;
    var $merge = $1311;
    label = 8;
    break;
   case 468:
    var $1313 = HEAP32[$30 >> 2];
    var $1314 = ($1313 | 0) == 1;
    if ($1314) {
      label = 470;
      break;
    } else {
      label = 469;
      break;
    }
   case 469:
    ___assert_func(5246100, 1694, 5246600, 5245876);
    label = 470;
    break;
   case 470:
    var $1316 = HEAP8[$1];
    var $1317 = $1316 & 4;
    var $1318 = $1317 << 24 >> 24 == 0;
    if ($1318) {
      label = 471;
      break;
    } else {
      label = 472;
      break;
    }
   case 471:
    ___assert_func(5246100, 1695, 5246600, 5245848);
    label = 472;
    break;
   case 472:
    var $1321 = $49 & 255;
    var $1322 = $1321 + 5242880 | 0;
    var $1323 = HEAP8[$1322];
    var $1324 = $1323 << 24 >> 24 == -1;
    if ($1324) {
      label = 473;
      break;
    } else {
      label = 474;
      break;
    }
   case 473:
    var $1326 = HEAP8[$2];
    var $1327 = $1326 & -128;
    var $1328 = $1327 | 24;
    HEAP8[$2] = $1328;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 474:
    var $1330$0 = $1323;
    var $1330$1 = $1323 << 24 >> 24 < 0 ? -1 : 0;
    var $st$2$0 = $31 | 0;
    HEAP32[$st$2$0 >> 2] = $1330$0;
    var $st$2$1 = $31 + 4 | 0;
    HEAP32[$st$2$1 >> 2] = $1330$1;
    HEAP8[$8] = 48;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 475:
    var $1332 = HEAP8[$1];
    var $1333 = $1332 & 4;
    var $1334 = $1333 << 24 >> 24 == 0;
    if ($1334) {
      label = 476;
      break;
    } else {
      label = 477;
      break;
    }
   case 476:
    ___assert_func(5246100, 1712, 5246600, 5245848);
    label = 477;
    break;
   case 477:
    var $1337 = $49 << 24 >> 24 == 13;
    if ($1337) {
      label = 478;
      break;
    } else {
      label = 479;
      break;
    }
   case 478:
    HEAP8[$8] = 50;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 479:
    var $1340 = $49 & 255;
    var $1341 = $1340 + 5242880 | 0;
    var $1342 = HEAP8[$1341];
    var $1343 = $1342 << 24 >> 24 == -1;
    if ($1343) {
      label = 480;
      break;
    } else {
      label = 483;
      break;
    }
   case 480:
    if ($49 << 24 >> 24 == 59 | $49 << 24 >> 24 == 32) {
      label = 481;
      break;
    } else {
      label = 482;
      break;
    }
   case 481:
    HEAP8[$8] = 49;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 482:
    var $1347 = HEAP8[$2];
    var $1348 = $1347 & -128;
    var $1349 = $1348 | 24;
    HEAP8[$2] = $1349;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 483:
    var $st$0$0 = $31 | 0;
    var $1351$0 = HEAP32[$st$0$0 >> 2];
    var $st$0$1 = $31 + 4 | 0;
    var $1351$1 = HEAP32[$st$0$1 >> 2];
    var $1352$0 = $1351$0 << 4 | 0 >>> 28;
    var $1352$1 = $1351$1 << 4 | $1351$0 >>> 28;
    var $1353$0 = $1342;
    var $1353$1 = $1342 << 24 >> 24 < 0 ? -1 : 0;
    var $1354$0 = (i64Math.add($1352$0, $1352$1, $1353$0, $1353$1), HEAP32[tempDoublePtr >> 2]);
    var $1354$1 = HEAP32[tempDoublePtr + 4 >> 2];
    var $1355 = $1354$1 >>> 0 < $1351$1 >>> 0 | $1354$1 >>> 0 == $1351$1 >>> 0 & $1354$0 >>> 0 < $1351$0 >>> 0;
    var $$etemp$10$0 = -1;
    var $$etemp$10$1 = -1;
    var $1356 = ($1354$0 | 0) == ($$etemp$10$0 | 0) & ($1354$1 | 0) == ($$etemp$10$1 | 0);
    var $or_cond3 = $1355 | $1356;
    if ($or_cond3) {
      label = 484;
      break;
    } else {
      label = 485;
      break;
    }
   case 484:
    var $1358 = HEAP8[$2];
    var $1359 = $1358 & -128;
    var $1360 = $1359 | 23;
    HEAP8[$2] = $1360;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 485:
    var $st$0$0 = $31 | 0;
    HEAP32[$st$0$0 >> 2] = $1354$0;
    var $st$0$1 = $31 + 4 | 0;
    HEAP32[$st$0$1 >> 2] = $1354$1;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 486:
    var $1363 = HEAP8[$1];
    var $1364 = $1363 & 4;
    var $1365 = $1364 << 24 >> 24 == 0;
    if ($1365) {
      label = 487;
      break;
    } else {
      label = 488;
      break;
    }
   case 487:
    ___assert_func(5246100, 1747, 5246600, 5245848);
    label = 488;
    break;
   case 488:
    var $1368 = $49 << 24 >> 24 == 13;
    if ($1368) {
      label = 489;
      break;
    } else {
      var $body_mark_5 = $body_mark_1;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    }
   case 489:
    HEAP8[$8] = 50;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 490:
    var $1371 = HEAP8[$1];
    var $1372 = $1371 & 4;
    var $1373 = $1372 << 24 >> 24 == 0;
    if ($1373) {
      label = 491;
      break;
    } else {
      label = 492;
      break;
    }
   case 491:
    ___assert_func(5246100, 1758, 5246600, 5245848);
    label = 492;
    break;
   case 492:
    if ($54) {
      label = 494;
      break;
    } else {
      label = 493;
      break;
    }
   case 493:
    var $1377 = HEAP8[$2];
    var $1378 = $1377 & -128;
    var $1379 = $1378 | 27;
    HEAP8[$2] = $1379;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 494:
    HEAP32[$30 >> 2] = 0;
    var $st$1$0 = $31 | 0;
    var $1381$0 = HEAP32[$st$1$0 >> 2];
    var $st$1$1 = $31 + 4 | 0;
    var $1381$1 = HEAP32[$st$1$1 >> 2];
    var $$etemp$11$0 = 0;
    var $$etemp$11$1 = 0;
    var $1382 = ($1381$0 | 0) == ($$etemp$11$0 | 0) & ($1381$1 | 0) == ($$etemp$11$1 | 0);
    if ($1382) {
      label = 495;
      break;
    } else {
      label = 496;
      break;
    }
   case 495:
    var $1384 = HEAP8[$1];
    var $1385 = $1384 | 32;
    HEAP8[$1] = $1385;
    HEAP8[$8] = 41;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 496:
    HEAP8[$8] = 53;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 497:
    var $st$0$0 = $31 | 0;
    var $1388$0 = HEAP32[$st$0$0 >> 2];
    var $st$0$1 = $31 + 4 | 0;
    var $1388$1 = HEAP32[$st$0$1 >> 2];
    var $1389 = $p_1;
    var $1390 = $35 - $1389 | 0;
    var $1391$0 = $1390;
    var $1391$1 = ($1390 | 0) < 0 ? -1 : 0;
    var $1392 = $1388$1 >>> 0 < $1391$1 >>> 0 | $1388$1 >>> 0 == $1391$1 >>> 0 & $1388$0 >>> 0 < $1391$0 >>> 0;
    var $_840$0 = $1392 ? $1388$0 : $1391$0;
    var $_840$1 = $1392 ? $1388$1 : $1391$1;
    var $1393 = HEAP8[$1];
    var $1394 = $1393 & 4;
    var $1395 = $1394 << 24 >> 24 == 0;
    if ($1395) {
      label = 498;
      break;
    } else {
      var $1398$1 = $1388$1;
      var $1398$0 = $1388$0;
      label = 499;
      break;
    }
   case 498:
    ___assert_func(5246100, 1777, 5246600, 5245848);
    var $st$1$0 = $31 | 0;
    var $_pre4$0 = HEAP32[$st$1$0 >> 2];
    var $st$1$1 = $31 + 4 | 0;
    var $_pre4$1 = HEAP32[$st$1$1 >> 2];
    var $1398$1 = $_pre4$1;
    var $1398$0 = $_pre4$0;
    label = 499;
    break;
   case 499:
    var $1398$0;
    var $1398$1;
    var $$etemp$13$0 = -1;
    var $$etemp$13$1 = -1;
    var $$etemp$12$0 = 0;
    var $$etemp$12$1 = 0;
    if ($1398$0 == $$etemp$12$0 & $1398$1 == $$etemp$12$1 | $1398$0 == $$etemp$13$0 & $1398$1 == $$etemp$13$1) {
      label = 500;
      break;
    } else {
      var $1401$1 = $1398$1;
      var $1401$0 = $1398$0;
      label = 501;
      break;
    }
   case 500:
    ___assert_func(5246100, 1779, 5246600, 5245896);
    var $st$1$0 = $31 | 0;
    var $_pre5$0 = HEAP32[$st$1$0 >> 2];
    var $st$1$1 = $31 + 4 | 0;
    var $_pre5$1 = HEAP32[$st$1$1 >> 2];
    var $1401$1 = $_pre5$1;
    var $1401$0 = $_pre5$0;
    label = 501;
    break;
   case 501:
    var $1401$0;
    var $1401$1;
    var $1402 = ($body_mark_1 | 0) == 0;
    var $p_1_body_mark_1841 = $1402 ? $p_1 : $body_mark_1;
    var $1403$0 = (i64Math.subtract($1401$0, $1401$1, $_840$0, $_840$1), HEAP32[tempDoublePtr >> 2]);
    var $1403$1 = HEAP32[tempDoublePtr + 4 >> 2];
    var $st$5$0 = $31 | 0;
    HEAP32[$st$5$0 >> 2] = $1403$0;
    var $st$5$1 = $31 + 4 | 0;
    HEAP32[$st$5$1 >> 2] = $1403$1;
    var $$etemp$14$0 = -1;
    var $$etemp$14$1 = 0;
    var $1404$0 = (i64Math.add($_840$0, $_840$1, $$etemp$14$0, $$etemp$14$1), HEAP32[tempDoublePtr >> 2]);
    var $1405$0 = $1404$0;
    var $1405 = $1405$0;
    var $1406 = $p_1 + $1405 | 0;
    var $1407 = ($1401$0 | 0) == ($_840$0 | 0) & ($1401$1 | 0) == ($_840$1 | 0);
    if ($1407) {
      label = 502;
      break;
    } else {
      var $body_mark_5 = $p_1_body_mark_1841;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $1406;
      label = 523;
      break;
    }
   case 502:
    HEAP8[$8] = 54;
    var $body_mark_5 = $p_1_body_mark_1841;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $1406;
    label = 523;
    break;
   case 503:
    var $1410 = HEAP8[$1];
    var $1411 = $1410 & 4;
    var $1412 = $1411 << 24 >> 24 == 0;
    if ($1412) {
      label = 504;
      break;
    } else {
      label = 505;
      break;
    }
   case 504:
    ___assert_func(5246100, 1796, 5246600, 5245848);
    label = 505;
    break;
   case 505:
    var $st$0$0 = $31 | 0;
    var $1414$0 = HEAP32[$st$0$0 >> 2];
    var $st$0$1 = $31 + 4 | 0;
    var $1414$1 = HEAP32[$st$0$1 >> 2];
    var $$etemp$15$0 = 0;
    var $$etemp$15$1 = 0;
    var $1415 = ($1414$0 | 0) == ($$etemp$15$0 | 0) & ($1414$1 | 0) == ($$etemp$15$1 | 0);
    if ($1415) {
      label = 507;
      break;
    } else {
      label = 506;
      break;
    }
   case 506:
    ___assert_func(5246100, 1797, 5246600, 5245820);
    label = 507;
    break;
   case 507:
    var $1418 = $49 << 24 >> 24 == 13;
    if ($1418) {
      label = 509;
      break;
    } else {
      label = 508;
      break;
    }
   case 508:
    var $1420 = HEAP8[$2];
    var $1421 = $1420 & -128;
    var $1422 = $1421 | 27;
    HEAP8[$2] = $1422;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 509:
    HEAP8[$8] = 55;
    var $1424 = HEAP8[$2];
    var $1425 = $1424 & 127;
    var $1426 = $1425 << 24 >> 24 == 0;
    if ($1426) {
      label = 511;
      break;
    } else {
      label = 510;
      break;
    }
   case 510:
    ___assert_func(5246100, 1800, 5246600, 5246064);
    label = 511;
    break;
   case 511:
    var $1429 = ($body_mark_1 | 0) == 0;
    if ($1429) {
      var $body_mark_5 = 0;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 512;
      break;
    }
   case 512:
    var $1431 = HEAP32[$36 >> 2];
    var $1432 = ($1431 | 0) == 0;
    if ($1432) {
      var $body_mark_5 = 0;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 513;
      break;
    }
   case 513:
    var $1434 = $p_1;
    var $1435 = $body_mark_1;
    var $1436 = $1434 - $1435 | 0;
    var $1437 = FUNCTION_TABLE[$1431]($parser, $body_mark_1, $1436);
    var $1438 = ($1437 | 0) == 0;
    var $_pre78 = HEAP8[$2];
    if ($1438) {
      var $1442 = $_pre78;
      label = 515;
      break;
    } else {
      label = 514;
      break;
    }
   case 514:
    var $1440 = $_pre78 & -128;
    var $1441 = $1440 | 7;
    HEAP8[$2] = $1441;
    var $1442 = $1441;
    label = 515;
    break;
   case 515:
    var $1442;
    var $1443 = $1442 & 127;
    var $1444 = $1443 << 24 >> 24 == 0;
    if ($1444) {
      var $body_mark_5 = 0;
      var $url_mark_3 = $url_mark_11475;
      var $header_value_mark_4 = $header_value_mark_2;
      var $header_field_mark_3 = $header_field_mark_11473;
      var $p_2 = $p_1;
      label = 523;
      break;
    } else {
      label = 516;
      break;
    }
   case 516:
    var $1446 = $data;
    var $1447 = 1 - $1446 | 0;
    var $1448 = $1447 + $1434 | 0;
    var $merge = $1448;
    label = 8;
    break;
   case 517:
    var $1450 = HEAP8[$1];
    var $1451 = $1450 & 4;
    var $1452 = $1451 << 24 >> 24 == 0;
    if ($1452) {
      label = 518;
      break;
    } else {
      label = 519;
      break;
    }
   case 518:
    ___assert_func(5246100, 1804, 5246600, 5245848);
    label = 519;
    break;
   case 519:
    if ($54) {
      label = 521;
      break;
    } else {
      label = 520;
      break;
    }
   case 520:
    var $1456 = HEAP8[$2];
    var $1457 = $1456 & -128;
    var $1458 = $1457 | 27;
    HEAP8[$2] = $1458;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 521:
    HEAP32[$30 >> 2] = 0;
    HEAP8[$8] = 47;
    var $body_mark_5 = $body_mark_1;
    var $url_mark_3 = $url_mark_11475;
    var $header_value_mark_4 = $header_value_mark_2;
    var $header_field_mark_3 = $header_field_mark_11473;
    var $p_2 = $p_1;
    label = 523;
    break;
   case 522:
    ___assert_func(5246100, 1811, 5246600, 5245796);
    var $1461 = HEAP8[$2];
    var $1462 = $1461 & -128;
    var $1463 = $1462 | 26;
    HEAP8[$2] = $1463;
    var $p_3 = $p_1;
    label = 553;
    break;
   case 523:
    var $p_2;
    var $header_field_mark_3;
    var $header_value_mark_4;
    var $url_mark_3;
    var $body_mark_5;
    var $1464 = $p_2 + 1 | 0;
    var $1465 = ($1464 | 0) == ($29 | 0);
    if ($1465) {
      label = 524;
      break;
    } else {
      var $p_01472 = $1464;
      var $header_field_mark_11473 = $header_field_mark_3;
      var $header_value_mark_11474 = $header_value_mark_4;
      var $url_mark_11475 = $url_mark_3;
      var $body_mark_01476 = $body_mark_5;
      label = 11;
      break;
    }
   case 524:
    var $1466 = ($header_field_mark_3 | 0) != 0;
    var $1467 = $1466 & 1;
    var $1468 = ($header_value_mark_4 | 0) != 0;
    var $1469 = $1468 & 1;
    var $1470 = $1469 + $1467 | 0;
    var $1471 = ($url_mark_3 | 0) != 0;
    var $1472 = $1471 & 1;
    var $1473 = $1470 + $1472 | 0;
    var $1474 = ($body_mark_5 | 0) != 0;
    var $1475 = $1474 & 1;
    var $1476 = $1473 + $1475 | 0;
    var $1477 = ($1476 | 0) < 2;
    if ($1477) {
      label = 526;
      break;
    } else {
      label = 525;
      break;
    }
   case 525:
    ___assert_func(5246100, 1830, 5246600, 5245688);
    label = 526;
    break;
   case 526:
    var $1479 = HEAP8[$2];
    var $1480 = $1479 & 127;
    var $1481 = $1480 << 24 >> 24 == 0;
    if ($1481) {
      label = 528;
      break;
    } else {
      label = 527;
      break;
    }
   case 527:
    ___assert_func(5246100, 1832, 5246600, 5246064);
    label = 528;
    break;
   case 528:
    if ($1466) {
      label = 529;
      break;
    } else {
      label = 533;
      break;
    }
   case 529:
    var $1485 = HEAP32[$45 >> 2];
    var $1486 = ($1485 | 0) == 0;
    if ($1486) {
      label = 533;
      break;
    } else {
      label = 530;
      break;
    }
   case 530:
    var $1488 = $header_field_mark_3;
    var $1489 = $35 - $1488 | 0;
    var $1490 = FUNCTION_TABLE[$1485]($parser, $header_field_mark_3, $1489);
    var $1491 = ($1490 | 0) == 0;
    var $_pre54 = HEAP8[$2];
    if ($1491) {
      var $1495 = $_pre54;
      label = 532;
      break;
    } else {
      label = 531;
      break;
    }
   case 531:
    var $1493 = $_pre54 & -128;
    var $1494 = $1493 | 4;
    HEAP8[$2] = $1494;
    var $1495 = $1494;
    label = 532;
    break;
   case 532:
    var $1495;
    var $1496 = $1495 & 127;
    var $1497 = $1496 << 24 >> 24 == 0;
    if ($1497) {
      label = 533;
      break;
    } else {
      var $merge = $len;
      label = 8;
      break;
    }
   case 533:
    var $1498 = HEAP8[$2];
    var $1499 = $1498 & 127;
    var $1500 = $1499 << 24 >> 24 == 0;
    if ($1500) {
      label = 535;
      break;
    } else {
      label = 534;
      break;
    }
   case 534:
    ___assert_func(5246100, 1833, 5246600, 5246064);
    label = 535;
    break;
   case 535:
    if ($1468) {
      label = 536;
      break;
    } else {
      label = 540;
      break;
    }
   case 536:
    var $1504 = HEAP32[$32 >> 2];
    var $1505 = ($1504 | 0) == 0;
    if ($1505) {
      label = 540;
      break;
    } else {
      label = 537;
      break;
    }
   case 537:
    var $1507 = $header_value_mark_4;
    var $1508 = $35 - $1507 | 0;
    var $1509 = FUNCTION_TABLE[$1504]($parser, $header_value_mark_4, $1508);
    var $1510 = ($1509 | 0) == 0;
    var $_pre55 = HEAP8[$2];
    if ($1510) {
      var $1514 = $_pre55;
      label = 539;
      break;
    } else {
      label = 538;
      break;
    }
   case 538:
    var $1512 = $_pre55 & -128;
    var $1513 = $1512 | 5;
    HEAP8[$2] = $1513;
    var $1514 = $1513;
    label = 539;
    break;
   case 539:
    var $1514;
    var $1515 = $1514 & 127;
    var $1516 = $1515 << 24 >> 24 == 0;
    if ($1516) {
      label = 540;
      break;
    } else {
      var $merge = $len;
      label = 8;
      break;
    }
   case 540:
    var $1517 = HEAP8[$2];
    var $1518 = $1517 & 127;
    var $1519 = $1518 << 24 >> 24 == 0;
    if ($1519) {
      label = 542;
      break;
    } else {
      label = 541;
      break;
    }
   case 541:
    ___assert_func(5246100, 1834, 5246600, 5246064);
    label = 542;
    break;
   case 542:
    if ($1471) {
      label = 543;
      break;
    } else {
      label = 547;
      break;
    }
   case 543:
    var $1523 = HEAP32[$43 >> 2];
    var $1524 = ($1523 | 0) == 0;
    if ($1524) {
      label = 547;
      break;
    } else {
      label = 544;
      break;
    }
   case 544:
    var $1526 = $url_mark_3;
    var $1527 = $35 - $1526 | 0;
    var $1528 = FUNCTION_TABLE[$1523]($parser, $url_mark_3, $1527);
    var $1529 = ($1528 | 0) == 0;
    var $_pre56 = HEAP8[$2];
    if ($1529) {
      var $1533 = $_pre56;
      label = 546;
      break;
    } else {
      label = 545;
      break;
    }
   case 545:
    var $1531 = $_pre56 & -128;
    var $1532 = $1531 | 3;
    HEAP8[$2] = $1532;
    var $1533 = $1532;
    label = 546;
    break;
   case 546:
    var $1533;
    var $1534 = $1533 & 127;
    var $1535 = $1534 << 24 >> 24 == 0;
    if ($1535) {
      label = 547;
      break;
    } else {
      var $merge = $len;
      label = 8;
      break;
    }
   case 547:
    var $1536 = HEAP8[$2];
    var $1537 = $1536 & 127;
    var $1538 = $1537 << 24 >> 24 == 0;
    if ($1538) {
      label = 549;
      break;
    } else {
      label = 548;
      break;
    }
   case 548:
    ___assert_func(5246100, 1835, 5246600, 5246064);
    label = 549;
    break;
   case 549:
    if ($1474) {
      label = 550;
      break;
    } else {
      var $merge = $len;
      label = 8;
      break;
    }
   case 550:
    var $1542 = HEAP32[$36 >> 2];
    var $1543 = ($1542 | 0) == 0;
    if ($1543) {
      var $merge = $len;
      label = 8;
      break;
    } else {
      label = 551;
      break;
    }
   case 551:
    var $1545 = $body_mark_5;
    var $1546 = $35 - $1545 | 0;
    var $1547 = FUNCTION_TABLE[$1542]($parser, $body_mark_5, $1546);
    var $1548 = ($1547 | 0) == 0;
    if ($1548) {
      var $merge = $len;
      label = 8;
      break;
    } else {
      label = 552;
      break;
    }
   case 552:
    var $1550 = HEAP8[$2];
    var $1551 = $1550 & -128;
    var $1552 = $1551 | 7;
    HEAP8[$2] = $1552;
    var $merge = $len;
    label = 8;
    break;
   case 553:
    var $p_3;
    var $1553 = HEAP8[$2];
    var $1554 = $1553 & 127;
    var $1555 = $1554 << 24 >> 24 == 0;
    if ($1555) {
      label = 554;
      break;
    } else {
      label = 555;
      break;
    }
   case 554:
    var $1557 = $1553 & -128;
    var $1558 = $1557 | 29;
    HEAP8[$2] = $1558;
    label = 555;
    break;
   case 555:
    var $1560 = $p_3;
    var $1561 = $data;
    var $1562 = $1560 - $1561 | 0;
    var $merge = $1562;
    label = 8;
    break;
  }
}
Module["_http_parser_execute"] = _http_parser_execute;
_http_parser_execute["X"] = 1;
function _get_settings() {
  return 5243392;
}
Module["_get_settings"] = _get_settings;
function _parse_url_char($s, $ch) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $ch << 24 >> 24;
    if ($ch << 24 >> 24 == 32 | $ch << 24 >> 24 == 13 | $ch << 24 >> 24 == 10 | $ch << 24 >> 24 == 9 | $ch << 24 >> 24 == 12) {
      var $_0 = 1;
      label = 28;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    if (($s | 0) == 19) {
      label = 4;
      break;
    } else if (($s | 0) == 20) {
      label = 6;
      break;
    } else if (($s | 0) == 21) {
      label = 8;
      break;
    } else if (($s | 0) == 22) {
      label = 9;
      break;
    } else if (($s | 0) == 25) {
      label = 10;
      break;
    } else if (($s | 0) == 23 | ($s | 0) == 24) {
      label = 11;
      break;
    } else if (($s | 0) == 26) {
      label = 16;
      break;
    } else if (($s | 0) == 27 | ($s | 0) == 28) {
      label = 19;
      break;
    } else if (($s | 0) == 29) {
      label = 22;
      break;
    } else if (($s | 0) == 30) {
      label = 25;
      break;
    } else {
      label = 27;
      break;
    }
   case 4:
    if ($ch << 24 >> 24 == 47 | $ch << 24 >> 24 == 42) {
      var $_0 = 26;
      label = 28;
      break;
    } else {
      label = 5;
      break;
    }
   case 5:
    var $5 = $ch | 32;
    var $_off83 = $5 - 97 & 255;
    var $6 = ($_off83 & 255) < 26;
    if ($6) {
      var $_0 = 20;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 6:
    var $8 = $ch | 32;
    var $_off82 = $8 - 97 & 255;
    var $9 = ($_off82 & 255) < 26;
    if ($9) {
      var $_0 = 20;
      label = 28;
      break;
    } else {
      label = 7;
      break;
    }
   case 7:
    var $11 = $ch << 24 >> 24 == 58;
    if ($11) {
      var $_0 = 21;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 8:
    var $13 = $ch << 24 >> 24 == 47;
    if ($13) {
      var $_0 = 22;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 9:
    var $15 = $ch << 24 >> 24 == 47;
    if ($15) {
      var $_0 = 23;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 10:
    if ($ch << 24 >> 24 == 47) {
      label = 12;
      break;
    } else if ($ch << 24 >> 24 == 63) {
      label = 13;
      break;
    } else if ($ch << 24 >> 24 == 64) {
      var $_0 = 1;
      label = 28;
      break;
    } else {
      label = 14;
      break;
    }
   case 11:
    if ($ch << 24 >> 24 == 47) {
      label = 12;
      break;
    } else if ($ch << 24 >> 24 == 63) {
      label = 13;
      break;
    } else if ($ch << 24 >> 24 == 64) {
      var $_0 = 25;
      label = 28;
      break;
    } else {
      label = 14;
      break;
    }
   case 12:
    var $_0 = 26;
    label = 28;
    break;
   case 13:
    var $_0 = 27;
    label = 28;
    break;
   case 14:
    var $21 = $ch | 32;
    var $_off = $21 - 97 & 255;
    var $22 = ($_off & 255) < 26;
    var $ch_off = $ch - 48 & 255;
    var $23 = ($ch_off & 255) < 10;
    var $or_cond = $22 | $23;
    if ($or_cond) {
      var $_0 = 24;
      label = 28;
      break;
    } else {
      label = 15;
      break;
    }
   case 15:
    if ($ch << 24 >> 24 == 126 | $ch << 24 >> 24 == 95 | $ch << 24 >> 24 == 93 | $ch << 24 >> 24 == 91 | $ch << 24 >> 24 == 61 | $ch << 24 >> 24 == 59 | $ch << 24 >> 24 == 58 | $ch << 24 >> 24 == 46 | $ch << 24 >> 24 == 45 | $ch << 24 >> 24 == 44 | $ch << 24 >> 24 == 43 | $ch << 24 >> 24 == 42 | $ch << 24 >> 24 == 41 | $ch << 24 >> 24 == 40 | $ch << 24 >> 24 == 39 | $ch << 24 >> 24 == 38 | $ch << 24 >> 24 == 37 | $ch << 24 >> 24 == 36 | $ch << 24 >> 24 == 33) {
      var $_0 = 24;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 16:
    var $25 = $ch & 255;
    var $26 = $25 >>> 3;
    var $27 = $26 + 5243424 | 0;
    var $28 = HEAP8[$27];
    var $29 = $28 & 255;
    var $30 = $25 & 7;
    var $31 = 1 << $30;
    var $32 = $29 & $31;
    var $33 = ($32 | 0) == 0;
    if ($33) {
      label = 17;
      break;
    } else {
      var $_0 = 26;
      label = 28;
      break;
    }
   case 17:
    if (($1 | 0) == 35) {
      label = 18;
      break;
    } else if (($1 | 0) == 63) {
      var $_0 = 27;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 18:
    var $_0 = 29;
    label = 28;
    break;
   case 19:
    var $37 = $ch & 255;
    var $38 = $37 >>> 3;
    var $39 = $38 + 5243424 | 0;
    var $40 = HEAP8[$39];
    var $41 = $40 & 255;
    var $42 = $37 & 7;
    var $43 = 1 << $42;
    var $44 = $41 & $43;
    var $45 = ($44 | 0) == 0;
    if ($45) {
      label = 20;
      break;
    } else {
      var $_0 = 28;
      label = 28;
      break;
    }
   case 20:
    if (($1 | 0) == 35) {
      label = 21;
      break;
    } else if (($1 | 0) == 63) {
      var $_0 = 28;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 21:
    var $_0 = 29;
    label = 28;
    break;
   case 22:
    var $49 = $ch & 255;
    var $50 = $49 >>> 3;
    var $51 = $50 + 5243424 | 0;
    var $52 = HEAP8[$51];
    var $53 = $52 & 255;
    var $54 = $49 & 7;
    var $55 = 1 << $54;
    var $56 = $53 & $55;
    var $57 = ($56 | 0) == 0;
    if ($57) {
      label = 23;
      break;
    } else {
      var $_0 = 30;
      label = 28;
      break;
    }
   case 23:
    if (($1 | 0) == 35) {
      label = 24;
      break;
    } else if (($1 | 0) == 63) {
      var $_0 = 30;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 24:
    var $_0 = 29;
    label = 28;
    break;
   case 25:
    var $61 = $ch & 255;
    var $62 = $61 >>> 3;
    var $63 = $62 + 5243424 | 0;
    var $64 = HEAP8[$63];
    var $65 = $64 & 255;
    var $66 = $61 & 7;
    var $67 = 1 << $66;
    var $68 = $65 & $67;
    var $69 = ($68 | 0) == 0;
    if ($69) {
      label = 26;
      break;
    } else {
      var $_0 = 30;
      label = 28;
      break;
    }
   case 26:
    if (($1 | 0) == 63 | ($1 | 0) == 35) {
      var $_0 = 30;
      label = 28;
      break;
    } else {
      label = 27;
      break;
    }
   case 27:
    var $_0 = 1;
    label = 28;
    break;
   case 28:
    var $_0;
    return $_0;
  }
}
_parse_url_char["X"] = 1;
function _http_message_needs_eof($parser) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $parser | 0;
    var $2 = HEAP8[$1];
    var $3 = $2 & 3;
    var $4 = $3 << 24 >> 24 == 0;
    if ($4) {
      label = 7;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $6 = $parser + 20 | 0;
    var $7 = HEAP16[$6 >> 1];
    var $_off = $7 - 100 & 65535;
    var $8 = ($_off & 65535) < 100;
    if ($8) {
      label = 7;
      break;
    } else {
      label = 4;
      break;
    }
   case 4:
    if ($7 << 16 >> 16 == 304 | $7 << 16 >> 16 == 204) {
      label = 7;
      break;
    } else {
      label = 5;
      break;
    }
   case 5:
    var $10 = $2 & -124;
    var $11 = $10 << 24 >> 24 == 0;
    if ($11) {
      label = 6;
      break;
    } else {
      label = 7;
      break;
    }
   case 6:
    var $13 = $parser + 8 | 0;
    var $st$1$0 = $13 | 0;
    var $14$0 = HEAP32[$st$1$0 >> 2];
    var $st$1$1 = $13 + 4 | 0;
    var $14$1 = HEAP32[$st$1$1 >> 2];
    var $$etemp$0$0 = -1;
    var $$etemp$0$1 = -1;
    var $15 = ($14$0 | 0) == ($$etemp$0$0 | 0) & ($14$1 | 0) == ($$etemp$0$1 | 0);
    var $_ = $15 & 1;
    return $_;
   case 7:
    return 0;
  }
}
function _http_method_str($m) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $m >>> 0 < 26;
    if ($1) {
      label = 3;
      break;
    } else {
      var $6 = 5245676;
      label = 4;
      break;
    }
   case 3:
    var $3 = 5243480 + ($m << 2) | 0;
    var $4 = HEAP32[$3 >> 2];
    var $6 = $4;
    label = 4;
    break;
   case 4:
    var $6;
    return $6;
  }
}
function _get_http_major($parser) {
  return HEAP16[$parser + 16 >> 1];
}
Module["_get_http_major"] = _get_http_major;
function _get_http_minor($parser) {
  return HEAP16[$parser + 18 >> 1];
}
Module["_get_http_minor"] = _get_http_minor;
function _get_status_code($parser) {
  return HEAP16[$parser + 20 >> 1];
}
Module["_get_status_code"] = _get_status_code;
function _get_upgrade($parser) {
  return HEAPU8[$parser + 23 | 0] >>> 7;
}
Module["_get_upgrade"] = _get_upgrade;
function _http_should_keep_alive($parser) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $parser + 16 | 0;
    var $2 = HEAP16[$1 >> 1];
    var $3 = $2 << 16 >> 16 == 0;
    if ($3) {
      label = 5;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $5 = $parser + 18 | 0;
    var $6 = HEAP16[$5 >> 1];
    var $7 = $6 << 16 >> 16 == 0;
    if ($7) {
      label = 5;
      break;
    } else {
      label = 4;
      break;
    }
   case 4:
    var $9 = $parser | 0;
    var $10 = HEAP8[$9];
    var $11 = $10 & 16;
    var $12 = $11 << 24 >> 24 == 0;
    if ($12) {
      label = 6;
      break;
    } else {
      var $_0 = 0;
      label = 7;
      break;
    }
   case 5:
    var $14 = $parser | 0;
    var $15 = HEAP8[$14];
    var $16 = $15 & 8;
    var $17 = $16 << 24 >> 24 == 0;
    if ($17) {
      var $_0 = 0;
      label = 7;
      break;
    } else {
      label = 6;
      break;
    }
   case 6:
    var $19 = _http_message_needs_eof($parser);
    var $20 = ($19 | 0) == 0;
    var $21 = $20 & 1;
    var $_0 = $21;
    label = 7;
    break;
   case 7:
    var $_0;
    return $_0;
  }
}
Module["_http_should_keep_alive"] = _http_should_keep_alive;
function _http_parser_init($parser, $t) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $parser | 0;
    HEAP32[$1 >> 2] = 0;
    HEAP32[$1 + 4 >> 2] = 0;
    HEAP32[$1 + 8 >> 2] = 0;
    HEAP32[$1 + 12 >> 2] = 0;
    HEAP32[$1 + 16 >> 2] = 0;
    HEAP32[$1 + 20 >> 2] = 0;
    var $2 = $t & 255;
    var $3 = $2 & 3;
    HEAP8[$1] = $3;
    var $4 = ($t | 0) == 0;
    if ($4) {
      var $8 = 17;
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $6 = ($t | 0) == 1;
    var $phitmp = $6 ? 4 : 2;
    var $8 = $phitmp;
    label = 4;
    break;
   case 4:
    var $8;
    var $9 = $parser + 1 | 0;
    HEAP8[$9] = $8;
    var $10 = $1 + 23 | 0;
    HEAP8[$10] = 0;
    return;
  }
}
function _http_errno_name($err) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $err >>> 0 < 30;
    if ($1) {
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    ___assert_func(5246100, 1911, 5246620, 5245612);
    label = 4;
    break;
   case 4:
    var $4 = 5243584 + ($err << 3) | 0;
    var $5 = HEAP32[$4 >> 2];
    return $5;
  }
}
function _http_errno_description($err) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $err >>> 0 < 30;
    if ($1) {
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    ___assert_func(5246100, 1917, 5246636, 5245612);
    label = 4;
    break;
   case 4:
    var $4 = 5243588 + ($err << 3) | 0;
    var $5 = HEAP32[$4 >> 2];
    return $5;
  }
}
function _create_parser($type) {
  var $2 = _malloc();
  _http_parser_init($2, $type);
  return $2;
}
Module["_create_parser"] = _create_parser;
function _get_error_name($parser) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $parser | 0;
    var $2 = $1 + 23 | 0;
    var $3 = HEAP8[$2];
    var $4 = $3 & 127;
    var $5 = $4 << 24 >> 24 == 0;
    if ($5) {
      var $_0 = 0;
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $7 = $4 & 255;
    var $8 = _http_errno_name($7);
    var $_0 = $8;
    label = 4;
    break;
   case 4:
    var $_0;
    return $_0;
  }
}
Module["_get_error_name"] = _get_error_name;
function _get_error_description($parser) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $parser | 0;
    var $2 = $1 + 23 | 0;
    var $3 = HEAP8[$2];
    var $4 = $3 & 127;
    var $5 = $4 << 24 >> 24 == 0;
    if ($5) {
      var $_0 = 0;
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $7 = $4 & 255;
    var $8 = _http_errno_description($7);
    var $_0 = $8;
    label = 4;
    break;
   case 4:
    var $_0;
    return $_0;
  }
}
Module["_get_error_description"] = _get_error_description;
function _get_method($parser) {
  return _http_method_str(HEAPU8[$parser + 22 | 0]);
}
Module["_get_method"] = _get_method;
function _malloc() {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = HEAP32[5246132 >> 2];
    var $2 = $1 >>> 4;
    var $3 = $2 & 3;
    var $4 = ($3 | 0) == 0;
    if ($4) {
      label = 9;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $6 = $2 & 1;
    var $7 = $6 ^ 5;
    var $8 = $7 << 1;
    var $9 = 5246172 + ($8 << 2) | 0;
    var $10 = $9;
    var $_sum106 = $8 + 2 | 0;
    var $11 = 5246172 + ($_sum106 << 2) | 0;
    var $12 = HEAP32[$11 >> 2];
    var $13 = $12 + 8 | 0;
    var $14 = HEAP32[$13 >> 2];
    var $15 = ($10 | 0) == ($14 | 0);
    if ($15) {
      label = 4;
      break;
    } else {
      label = 5;
      break;
    }
   case 4:
    var $17 = 1 << $7;
    var $18 = $17 ^ -1;
    var $19 = $1 & $18;
    HEAP32[5246132 >> 2] = $19;
    label = 8;
    break;
   case 5:
    var $21 = $14;
    var $22 = HEAP32[5246148 >> 2];
    var $23 = $21 >>> 0 < $22 >>> 0;
    if ($23) {
      label = 7;
      break;
    } else {
      label = 6;
      break;
    }
   case 6:
    HEAP32[$11 >> 2] = $14;
    var $25 = $14 + 12 | 0;
    HEAP32[$25 >> 2] = $10;
    label = 8;
    break;
   case 7:
    _abort();
   case 8:
    var $28 = $7 << 3;
    var $29 = $28 | 3;
    var $30 = $12 + 4 | 0;
    HEAP32[$30 >> 2] = $29;
    var $31 = $12;
    var $_sum107108 = $28 | 4;
    var $32 = $31 + $_sum107108 | 0;
    var $33 = $32;
    var $34 = HEAP32[$33 >> 2];
    var $35 = $34 | 1;
    HEAP32[$33 >> 2] = $35;
    var $36 = $13;
    var $mem_0 = $36;
    label = 34;
    break;
   case 9:
    var $38 = HEAP32[5246140 >> 2];
    var $39 = $38 >>> 0 < 32;
    if ($39) {
      label = 10;
      break;
    } else {
      var $132 = $38;
      label = 27;
      break;
    }
   case 10:
    var $41 = ($2 | 0) == 0;
    if ($41) {
      label = 23;
      break;
    } else {
      label = 11;
      break;
    }
   case 11:
    var $43 = $2 << 4;
    var $44 = $43 & -32;
    var $45 = -$44 | 0;
    var $46 = $43 & $45;
    var $47 = $46 - 1 | 0;
    var $48 = $47 >>> 12;
    var $49 = $48 & 16;
    var $50 = $47 >>> ($49 >>> 0);
    var $51 = $50 >>> 5;
    var $52 = $51 & 8;
    var $53 = $52 | $49;
    var $54 = $50 >>> ($52 >>> 0);
    var $55 = $54 >>> 2;
    var $56 = $55 & 4;
    var $57 = $53 | $56;
    var $58 = $54 >>> ($56 >>> 0);
    var $59 = $58 >>> 1;
    var $60 = $59 & 2;
    var $61 = $57 | $60;
    var $62 = $58 >>> ($60 >>> 0);
    var $63 = $62 >>> 1;
    var $64 = $63 & 1;
    var $65 = $61 | $64;
    var $66 = $62 >>> ($64 >>> 0);
    var $67 = $65 + $66 | 0;
    var $68 = $67 << 1;
    var $69 = 5246172 + ($68 << 2) | 0;
    var $70 = $69;
    var $_sum100 = $68 + 2 | 0;
    var $71 = 5246172 + ($_sum100 << 2) | 0;
    var $72 = HEAP32[$71 >> 2];
    var $73 = $72 + 8 | 0;
    var $74 = HEAP32[$73 >> 2];
    var $75 = ($70 | 0) == ($74 | 0);
    if ($75) {
      label = 12;
      break;
    } else {
      label = 13;
      break;
    }
   case 12:
    var $77 = 1 << $67;
    var $78 = $77 ^ -1;
    var $79 = $1 & $78;
    HEAP32[5246132 >> 2] = $79;
    label = 16;
    break;
   case 13:
    var $81 = $74;
    var $82 = HEAP32[5246148 >> 2];
    var $83 = $81 >>> 0 < $82 >>> 0;
    if ($83) {
      label = 15;
      break;
    } else {
      label = 14;
      break;
    }
   case 14:
    HEAP32[$71 >> 2] = $74;
    var $85 = $74 + 12 | 0;
    HEAP32[$85 >> 2] = $70;
    label = 16;
    break;
   case 15:
    _abort();
   case 16:
    var $88 = $67 << 3;
    var $89 = $88 - 32 | 0;
    var $90 = $72 + 4 | 0;
    HEAP32[$90 >> 2] = 35;
    var $91 = $72;
    var $92 = $72 + 32 | 0;
    var $93 = $89 | 1;
    var $94 = $72 + 36 | 0;
    HEAP32[$94 >> 2] = $93;
    var $95 = $91 + $88 | 0;
    var $96 = $95;
    HEAP32[$96 >> 2] = $89;
    var $97 = HEAP32[5246140 >> 2];
    var $98 = ($97 | 0) == 0;
    if ($98) {
      label = 22;
      break;
    } else {
      label = 17;
      break;
    }
   case 17:
    var $100 = HEAP32[5246152 >> 2];
    var $101 = $97 >>> 3;
    var $102 = $101 << 1;
    var $103 = 5246172 + ($102 << 2) | 0;
    var $104 = $103;
    var $105 = HEAP32[5246132 >> 2];
    var $106 = 1 << $101;
    var $107 = $105 & $106;
    var $108 = ($107 | 0) == 0;
    if ($108) {
      label = 18;
      break;
    } else {
      label = 19;
      break;
    }
   case 18:
    var $110 = $105 | $106;
    HEAP32[5246132 >> 2] = $110;
    var $_sum104_pre = $102 + 2 | 0;
    var $_pre = 5246172 + ($_sum104_pre << 2) | 0;
    var $F4_0 = $104;
    var $_pre_phi = $_pre;
    label = 21;
    break;
   case 19:
    var $_sum105 = $102 + 2 | 0;
    var $112 = 5246172 + ($_sum105 << 2) | 0;
    var $113 = HEAP32[$112 >> 2];
    var $114 = $113;
    var $115 = HEAP32[5246148 >> 2];
    var $116 = $114 >>> 0 < $115 >>> 0;
    if ($116) {
      label = 20;
      break;
    } else {
      var $F4_0 = $113;
      var $_pre_phi = $112;
      label = 21;
      break;
    }
   case 20:
    _abort();
   case 21:
    var $_pre_phi;
    var $F4_0;
    HEAP32[$_pre_phi >> 2] = $100;
    var $119 = $F4_0 + 12 | 0;
    HEAP32[$119 >> 2] = $100;
    var $120 = $100 + 8 | 0;
    HEAP32[$120 >> 2] = $F4_0;
    var $121 = $100 + 12 | 0;
    HEAP32[$121 >> 2] = $104;
    label = 22;
    break;
   case 22:
    HEAP32[5246140 >> 2] = $89;
    HEAP32[5246152 >> 2] = $92;
    var $123 = $73;
    var $mem_0 = $123;
    label = 34;
    break;
   case 23:
    var $125 = HEAP32[5246136 >> 2];
    var $126 = ($125 | 0) == 0;
    if ($126) {
      var $_pr = $38;
      label = 26;
      break;
    } else {
      label = 24;
      break;
    }
   case 24:
    var $128 = _tmalloc_small();
    var $129 = ($128 | 0) == 0;
    if ($129) {
      label = 25;
      break;
    } else {
      var $mem_0 = $128;
      label = 34;
      break;
    }
   case 25:
    var $_pr_pre = HEAP32[5246140 >> 2];
    var $_pr = $_pr_pre;
    label = 26;
    break;
   case 26:
    var $_pr;
    var $131 = $_pr >>> 0 < 32;
    if ($131) {
      label = 31;
      break;
    } else {
      var $132 = $_pr;
      label = 27;
      break;
    }
   case 27:
    var $132;
    var $133 = $132 - 32 | 0;
    var $134 = HEAP32[5246152 >> 2];
    var $135 = $133 >>> 0 > 15;
    if ($135) {
      label = 28;
      break;
    } else {
      label = 29;
      break;
    }
   case 28:
    var $137 = $134;
    var $138 = $134 + 32 | 0;
    HEAP32[5246152 >> 2] = $138;
    HEAP32[5246140 >> 2] = $133;
    var $139 = $133 | 1;
    var $140 = $134 + 36 | 0;
    HEAP32[$140 >> 2] = $139;
    var $141 = $137 + $132 | 0;
    var $142 = $141;
    HEAP32[$142 >> 2] = $133;
    var $143 = $134 + 4 | 0;
    HEAP32[$143 >> 2] = 35;
    label = 30;
    break;
   case 29:
    HEAP32[5246140 >> 2] = 0;
    HEAP32[5246152 >> 2] = 0;
    var $145 = $132 | 3;
    var $146 = $134 + 4 | 0;
    HEAP32[$146 >> 2] = $145;
    var $147 = $134;
    var $_sum97 = $132 + 4 | 0;
    var $148 = $147 + $_sum97 | 0;
    var $149 = $148;
    var $150 = HEAP32[$149 >> 2];
    var $151 = $150 | 1;
    HEAP32[$149 >> 2] = $151;
    label = 30;
    break;
   case 30:
    var $153 = $134 + 8 | 0;
    var $154 = $153;
    var $mem_0 = $154;
    label = 34;
    break;
   case 31:
    var $156 = HEAP32[5246144 >> 2];
    var $157 = $156 >>> 0 > 32;
    if ($157) {
      label = 32;
      break;
    } else {
      label = 33;
      break;
    }
   case 32:
    var $159 = $156 - 32 | 0;
    HEAP32[5246144 >> 2] = $159;
    var $160 = HEAP32[5246156 >> 2];
    var $161 = $160 + 32 | 0;
    HEAP32[5246156 >> 2] = $161;
    var $162 = $159 | 1;
    var $163 = $160 + 36 | 0;
    HEAP32[$163 >> 2] = $162;
    var $164 = $160 + 4 | 0;
    HEAP32[$164 >> 2] = 35;
    var $165 = $160 + 8 | 0;
    var $166 = $165;
    var $mem_0 = $166;
    label = 34;
    break;
   case 33:
    var $168 = _sys_alloc();
    var $mem_0 = $168;
    label = 34;
    break;
   case 34:
    var $mem_0;
    return $mem_0;
  }
}
_malloc["X"] = 1;
function _segment_holding($addr) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $sp_0 = 5246576;
    label = 3;
    break;
   case 3:
    var $sp_0;
    var $2 = $sp_0 | 0;
    var $3 = HEAP32[$2 >> 2];
    var $4 = $3 >>> 0 > $addr >>> 0;
    if ($4) {
      label = 5;
      break;
    } else {
      label = 4;
      break;
    }
   case 4:
    var $6 = $sp_0 + 4 | 0;
    var $7 = HEAP32[$6 >> 2];
    var $8 = $3 + $7 | 0;
    var $9 = $8 >>> 0 > $addr >>> 0;
    if ($9) {
      var $_0 = $sp_0;
      label = 6;
      break;
    } else {
      label = 5;
      break;
    }
   case 5:
    var $11 = $sp_0 + 8 | 0;
    var $12 = HEAP32[$11 >> 2];
    var $13 = ($12 | 0) == 0;
    if ($13) {
      var $_0 = 0;
      label = 6;
      break;
    } else {
      var $sp_0 = $12;
      label = 3;
      break;
    }
   case 6:
    var $_0;
    return $_0;
  }
}
function _init_top($p, $psize) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $p;
    var $2 = $p + 8 | 0;
    var $3 = $2;
    var $4 = $3 & 7;
    var $5 = ($4 | 0) == 0;
    if ($5) {
      var $10 = 0;
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $7 = -$3 | 0;
    var $8 = $7 & 7;
    var $10 = $8;
    label = 4;
    break;
   case 4:
    var $10;
    var $11 = $1 + $10 | 0;
    var $12 = $11;
    var $13 = $psize - $10 | 0;
    HEAP32[5246156 >> 2] = $12;
    HEAP32[5246144 >> 2] = $13;
    var $14 = $13 | 1;
    var $_sum = $10 + 4 | 0;
    var $15 = $1 + $_sum | 0;
    var $16 = $15;
    HEAP32[$16 >> 2] = $14;
    var $_sum2 = $psize + 4 | 0;
    var $17 = $1 + $_sum2 | 0;
    var $18 = $17;
    HEAP32[$18 >> 2] = 40;
    var $19 = HEAP32[5243472 >> 2];
    HEAP32[5246160 >> 2] = $19;
    return;
  }
}
function _init_bins() {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $i_02 = 0;
    label = 3;
    break;
   case 3:
    var $i_02;
    var $2 = $i_02 << 1;
    var $3 = 5246172 + ($2 << 2) | 0;
    var $4 = $3;
    var $_sum = $2 + 3 | 0;
    var $5 = 5246172 + ($_sum << 2) | 0;
    HEAP32[$5 >> 2] = $4;
    var $_sum1 = $2 + 2 | 0;
    var $6 = 5246172 + ($_sum1 << 2) | 0;
    HEAP32[$6 >> 2] = $4;
    var $7 = $i_02 + 1 | 0;
    var $exitcond = ($7 | 0) == 32;
    if ($exitcond) {
      label = 4;
      break;
    } else {
      var $i_02 = $7;
      label = 3;
      break;
    }
   case 4:
    return;
  }
}
function _sys_alloc() {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = HEAP32[5243456 >> 2];
    var $2 = ($1 | 0) == 0;
    if ($2) {
      label = 3;
      break;
    } else {
      label = 4;
      break;
    }
   case 3:
    _init_mparams();
    label = 4;
    break;
   case 4:
    var $5 = HEAP32[5246572 >> 2];
    var $6 = $5 & 4;
    var $7 = ($6 | 0) == 0;
    if ($7) {
      label = 5;
      break;
    } else {
      var $tsize_125 = 0;
      label = 23;
      break;
    }
   case 5:
    var $9 = HEAP32[5246156 >> 2];
    var $10 = ($9 | 0) == 0;
    if ($10) {
      label = 7;
      break;
    } else {
      label = 6;
      break;
    }
   case 6:
    var $12 = $9;
    var $13 = _segment_holding($12);
    var $14 = ($13 | 0) == 0;
    if ($14) {
      label = 7;
      break;
    } else {
      label = 12;
      break;
    }
   case 7:
    var $15 = _sbrk(0);
    var $16 = ($15 | 0) == -1;
    if ($16) {
      var $tsize_0121720_ph = 0;
      label = 21;
      break;
    } else {
      label = 8;
      break;
    }
   case 8:
    var $18 = HEAP32[5243464 >> 2];
    var $19 = $18 + 79 | 0;
    var $20 = -$18 | 0;
    var $21 = $19 & $20;
    var $22 = $15;
    var $23 = HEAP32[5243460 >> 2];
    var $24 = $23 - 1 | 0;
    var $25 = $24 & $22;
    var $26 = ($25 | 0) == 0;
    if ($26) {
      var $asize_0 = $21;
      label = 10;
      break;
    } else {
      label = 9;
      break;
    }
   case 9:
    var $28 = $24 + $22 | 0;
    var $29 = -$23 | 0;
    var $30 = $28 & $29;
    var $31 = $21 - $22 | 0;
    var $32 = $31 + $30 | 0;
    var $asize_0 = $32;
    label = 10;
    break;
   case 10:
    var $asize_0;
    var $34 = $asize_0 >>> 0 < 2147483647;
    if ($34) {
      label = 11;
      break;
    } else {
      var $tsize_0121720_ph = 0;
      label = 21;
      break;
    }
   case 11:
    var $36 = _sbrk($asize_0);
    var $37 = ($36 | 0) == ($15 | 0);
    var $asize_0_ = $37 ? $asize_0 : 0;
    var $_ = $37 ? $15 : -1;
    var $tbase_0 = $_;
    var $tsize_0 = $asize_0_;
    var $br_0 = $36;
    var $asize_1 = $asize_0;
    label = 14;
    break;
   case 12:
    var $39 = HEAP32[5246144 >> 2];
    var $40 = HEAP32[5243464 >> 2];
    var $41 = 79 - $39 | 0;
    var $42 = $41 + $40 | 0;
    var $43 = -$40 | 0;
    var $44 = $42 & $43;
    var $45 = $44 >>> 0 < 2147483647;
    if ($45) {
      label = 13;
      break;
    } else {
      var $tsize_0121720_ph = 0;
      label = 21;
      break;
    }
   case 13:
    var $47 = _sbrk($44);
    var $48 = $13 | 0;
    var $49 = HEAP32[$48 >> 2];
    var $50 = $13 + 4 | 0;
    var $51 = HEAP32[$50 >> 2];
    var $52 = $49 + $51 | 0;
    var $53 = ($47 | 0) == ($52 | 0);
    var $_1 = $53 ? $44 : 0;
    var $_2 = $53 ? $47 : -1;
    var $tbase_0 = $_2;
    var $tsize_0 = $_1;
    var $br_0 = $47;
    var $asize_1 = $44;
    label = 14;
    break;
   case 14:
    var $asize_1;
    var $br_0;
    var $tsize_0;
    var $tbase_0;
    var $55 = -$asize_1 | 0;
    var $56 = ($tbase_0 | 0) == -1;
    if ($56) {
      label = 15;
      break;
    } else {
      var $tsize_229 = $tsize_0;
      var $tbase_230 = $tbase_0;
      label = 26;
      break;
    }
   case 15:
    var $58 = ($br_0 | 0) != -1;
    var $59 = $asize_1 >>> 0 < 2147483647;
    var $or_cond = $58 & $59;
    var $60 = $asize_1 >>> 0 < 80;
    var $or_cond1 = $or_cond & $60;
    if ($or_cond1) {
      label = 16;
      break;
    } else {
      var $asize_2 = $asize_1;
      label = 20;
      break;
    }
   case 16:
    var $62 = HEAP32[5243464 >> 2];
    var $63 = 79 - $asize_1 | 0;
    var $64 = $63 + $62 | 0;
    var $65 = -$62 | 0;
    var $66 = $64 & $65;
    var $67 = $66 >>> 0 < 2147483647;
    if ($67) {
      label = 17;
      break;
    } else {
      var $asize_2 = $asize_1;
      label = 20;
      break;
    }
   case 17:
    var $69 = _sbrk($66);
    var $70 = ($69 | 0) == -1;
    if ($70) {
      label = 19;
      break;
    } else {
      label = 18;
      break;
    }
   case 18:
    var $72 = $66 + $asize_1 | 0;
    var $asize_2 = $72;
    label = 20;
    break;
   case 19:
    var $74 = _sbrk($55);
    var $tsize_0121720_ph = $tsize_0;
    label = 21;
    break;
   case 20:
    var $asize_2;
    var $76 = ($br_0 | 0) == -1;
    if ($76) {
      label = 22;
      break;
    } else {
      var $tsize_229 = $asize_2;
      var $tbase_230 = $br_0;
      label = 26;
      break;
    }
   case 21:
    var $tsize_0121720_ph;
    var $77 = HEAP32[5246572 >> 2];
    var $78 = $77 | 4;
    HEAP32[5246572 >> 2] = $78;
    var $tsize_125 = $tsize_0121720_ph;
    label = 23;
    break;
   case 22:
    var $79 = HEAP32[5246572 >> 2];
    var $80 = $79 | 4;
    HEAP32[5246572 >> 2] = $80;
    var $tsize_125 = $tsize_0;
    label = 23;
    break;
   case 23:
    var $tsize_125;
    var $81 = HEAP32[5243464 >> 2];
    var $82 = $81 + 79 | 0;
    var $83 = -$81 | 0;
    var $84 = $82 & $83;
    var $85 = $84 >>> 0 < 2147483647;
    if ($85) {
      label = 24;
      break;
    } else {
      label = 47;
      break;
    }
   case 24:
    var $87 = _sbrk($84);
    var $88 = _sbrk(0);
    var $notlhs = ($87 | 0) != -1;
    var $notrhs = ($88 | 0) != -1;
    var $or_cond3_not = $notrhs & $notlhs;
    var $89 = $87 >>> 0 < $88 >>> 0;
    var $or_cond4 = $or_cond3_not & $89;
    if ($or_cond4) {
      label = 25;
      break;
    } else {
      label = 47;
      break;
    }
   case 25:
    var $90 = $88;
    var $91 = $87;
    var $92 = $90 - $91 | 0;
    var $93 = $92 >>> 0 > 72;
    var $_tsize_1 = $93 ? $92 : $tsize_125;
    var $_tbase_1 = $93 ? $87 : -1;
    var $94 = ($_tbase_1 | 0) == -1;
    if ($94) {
      label = 47;
      break;
    } else {
      var $tsize_229 = $_tsize_1;
      var $tbase_230 = $_tbase_1;
      label = 26;
      break;
    }
   case 26:
    var $tbase_230;
    var $tsize_229;
    var $95 = HEAP32[5246564 >> 2];
    var $96 = $95 + $tsize_229 | 0;
    HEAP32[5246564 >> 2] = $96;
    var $97 = HEAP32[5246568 >> 2];
    var $98 = $96 >>> 0 > $97 >>> 0;
    if ($98) {
      label = 27;
      break;
    } else {
      label = 28;
      break;
    }
   case 27:
    HEAP32[5246568 >> 2] = $96;
    label = 28;
    break;
   case 28:
    var $101 = HEAP32[5246156 >> 2];
    var $102 = ($101 | 0) == 0;
    if ($102) {
      label = 29;
      break;
    } else {
      var $sp_042 = 5246576;
      label = 32;
      break;
    }
   case 29:
    var $104 = HEAP32[5246148 >> 2];
    var $105 = ($104 | 0) == 0;
    var $106 = $tbase_230 >>> 0 < $104 >>> 0;
    var $or_cond5 = $105 | $106;
    if ($or_cond5) {
      label = 30;
      break;
    } else {
      label = 31;
      break;
    }
   case 30:
    HEAP32[5246148 >> 2] = $tbase_230;
    label = 31;
    break;
   case 31:
    HEAP32[5246576 >> 2] = $tbase_230;
    HEAP32[5246580 >> 2] = $tsize_229;
    HEAP32[5246588 >> 2] = 0;
    var $109 = HEAP32[5243456 >> 2];
    HEAP32[5246168 >> 2] = $109;
    HEAP32[5246164 >> 2] = -1;
    _init_bins();
    var $110 = $tbase_230;
    var $111 = $tsize_229 - 40 | 0;
    _init_top($110, $111);
    label = 45;
    break;
   case 32:
    var $sp_042;
    var $112 = $sp_042 | 0;
    var $113 = HEAP32[$112 >> 2];
    var $114 = $sp_042 + 4 | 0;
    var $115 = HEAP32[$114 >> 2];
    var $116 = $113 + $115 | 0;
    var $117 = ($tbase_230 | 0) == ($116 | 0);
    if ($117) {
      label = 34;
      break;
    } else {
      label = 33;
      break;
    }
   case 33:
    var $119 = $sp_042 + 8 | 0;
    var $120 = HEAP32[$119 >> 2];
    var $121 = ($120 | 0) == 0;
    if ($121) {
      label = 37;
      break;
    } else {
      var $sp_042 = $120;
      label = 32;
      break;
    }
   case 34:
    var $122 = $sp_042 + 12 | 0;
    var $123 = HEAP32[$122 >> 2];
    var $124 = $123 & 8;
    var $125 = ($124 | 0) == 0;
    if ($125) {
      label = 35;
      break;
    } else {
      label = 37;
      break;
    }
   case 35:
    var $127 = $101;
    var $128 = $127 >>> 0 >= $113 >>> 0;
    var $129 = $127 >>> 0 < $tbase_230 >>> 0;
    var $or_cond31 = $128 & $129;
    if ($or_cond31) {
      label = 36;
      break;
    } else {
      label = 37;
      break;
    }
   case 36:
    var $131 = $115 + $tsize_229 | 0;
    HEAP32[$114 >> 2] = $131;
    var $132 = HEAP32[5246156 >> 2];
    var $133 = HEAP32[5246144 >> 2];
    var $134 = $133 + $tsize_229 | 0;
    _init_top($132, $134);
    label = 45;
    break;
   case 37:
    var $135 = HEAP32[5246148 >> 2];
    var $136 = $tbase_230 >>> 0 < $135 >>> 0;
    if ($136) {
      label = 38;
      break;
    } else {
      label = 39;
      break;
    }
   case 38:
    HEAP32[5246148 >> 2] = $tbase_230;
    label = 39;
    break;
   case 39:
    var $138 = $tbase_230 + $tsize_229 | 0;
    var $sp_135 = 5246576;
    label = 40;
    break;
   case 40:
    var $sp_135;
    var $140 = $sp_135 | 0;
    var $141 = HEAP32[$140 >> 2];
    var $142 = ($141 | 0) == ($138 | 0);
    if ($142) {
      label = 42;
      break;
    } else {
      label = 41;
      break;
    }
   case 41:
    var $144 = $sp_135 + 8 | 0;
    var $145 = HEAP32[$144 >> 2];
    var $146 = ($145 | 0) == 0;
    if ($146) {
      label = 44;
      break;
    } else {
      var $sp_135 = $145;
      label = 40;
      break;
    }
   case 42:
    var $147 = $sp_135 + 12 | 0;
    var $148 = HEAP32[$147 >> 2];
    var $149 = $148 & 8;
    var $150 = ($149 | 0) == 0;
    if ($150) {
      label = 43;
      break;
    } else {
      label = 44;
      break;
    }
   case 43:
    HEAP32[$140 >> 2] = $tbase_230;
    var $152 = $sp_135 + 4 | 0;
    var $153 = HEAP32[$152 >> 2];
    var $154 = $153 + $tsize_229 | 0;
    HEAP32[$152 >> 2] = $154;
    var $155 = _prepend_alloc($tbase_230, $138);
    var $_0 = $155;
    label = 48;
    break;
   case 44:
    _add_segment($tbase_230, $tsize_229);
    label = 45;
    break;
   case 45:
    var $157 = HEAP32[5246144 >> 2];
    var $158 = $157 >>> 0 > 32;
    if ($158) {
      label = 46;
      break;
    } else {
      label = 47;
      break;
    }
   case 46:
    var $160 = $157 - 32 | 0;
    HEAP32[5246144 >> 2] = $160;
    var $161 = HEAP32[5246156 >> 2];
    var $162 = $161 + 32 | 0;
    HEAP32[5246156 >> 2] = $162;
    var $163 = $160 | 1;
    var $164 = $161 + 36 | 0;
    HEAP32[$164 >> 2] = $163;
    var $165 = $161 + 4 | 0;
    HEAP32[$165 >> 2] = 35;
    var $166 = $161 + 8 | 0;
    var $167 = $166;
    var $_0 = $167;
    label = 48;
    break;
   case 47:
    var $168 = ___errno_location();
    HEAP32[$168 >> 2] = 12;
    var $_0 = 0;
    label = 48;
    break;
   case 48:
    var $_0;
    return $_0;
  }
}
_sys_alloc["X"] = 1;
function _tmalloc_small() {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = HEAP32[5246136 >> 2];
    var $2 = -$1 | 0;
    var $3 = $1 & $2;
    var $4 = $3 - 1 | 0;
    var $5 = $4 >>> 12;
    var $6 = $5 & 16;
    var $7 = $4 >>> ($6 >>> 0);
    var $8 = $7 >>> 5;
    var $9 = $8 & 8;
    var $10 = $9 | $6;
    var $11 = $7 >>> ($9 >>> 0);
    var $12 = $11 >>> 2;
    var $13 = $12 & 4;
    var $14 = $10 | $13;
    var $15 = $11 >>> ($13 >>> 0);
    var $16 = $15 >>> 1;
    var $17 = $16 & 2;
    var $18 = $14 | $17;
    var $19 = $15 >>> ($17 >>> 0);
    var $20 = $19 >>> 1;
    var $21 = $20 & 1;
    var $22 = $18 | $21;
    var $23 = $19 >>> ($21 >>> 0);
    var $24 = $22 + $23 | 0;
    var $25 = 5246436 + ($24 << 2) | 0;
    var $26 = HEAP32[$25 >> 2];
    var $27 = $26 + 4 | 0;
    var $28 = HEAP32[$27 >> 2];
    var $29 = $28 - 32 | 0;
    var $30 = $29 & -8;
    var $t_0 = $26;
    var $v_0 = $26;
    var $rsize_0 = $30;
    label = 3;
    break;
   case 3:
    var $rsize_0;
    var $v_0;
    var $t_0;
    var $32 = $t_0 + 16 | 0;
    var $33 = HEAP32[$32 >> 2];
    var $34 = ($33 | 0) == 0;
    if ($34) {
      label = 4;
      break;
    } else {
      var $39 = $33;
      label = 5;
      break;
    }
   case 4:
    var $36 = $t_0 + 20 | 0;
    var $37 = HEAP32[$36 >> 2];
    var $38 = ($37 | 0) == 0;
    if ($38) {
      label = 6;
      break;
    } else {
      var $39 = $37;
      label = 5;
      break;
    }
   case 5:
    var $39;
    var $40 = $39 + 4 | 0;
    var $41 = HEAP32[$40 >> 2];
    var $42 = $41 - 32 | 0;
    var $43 = $42 & -8;
    var $44 = $43 >>> 0 < $rsize_0 >>> 0;
    var $_rsize_0 = $44 ? $43 : $rsize_0;
    var $_v_0 = $44 ? $39 : $v_0;
    var $t_0 = $39;
    var $v_0 = $_v_0;
    var $rsize_0 = $_rsize_0;
    label = 3;
    break;
   case 6:
    var $46 = $v_0;
    var $47 = HEAP32[5246148 >> 2];
    var $48 = $46 >>> 0 < $47 >>> 0;
    if ($48) {
      label = 48;
      break;
    } else {
      label = 7;
      break;
    }
   case 7:
    var $50 = $v_0 + 32 | 0;
    var $51 = $50;
    var $52 = $v_0 + 24 | 0;
    var $53 = HEAP32[$52 >> 2];
    var $54 = $v_0 + 12 | 0;
    var $55 = HEAP32[$54 >> 2];
    var $56 = ($55 | 0) == ($v_0 | 0);
    if ($56) {
      label = 11;
      break;
    } else {
      label = 8;
      break;
    }
   case 8:
    var $58 = $v_0 + 8 | 0;
    var $59 = HEAP32[$58 >> 2];
    var $60 = $59;
    var $61 = $60 >>> 0 < $47 >>> 0;
    if ($61) {
      label = 10;
      break;
    } else {
      label = 9;
      break;
    }
   case 9:
    var $63 = $59 + 12 | 0;
    HEAP32[$63 >> 2] = $55;
    var $64 = $55 + 8 | 0;
    HEAP32[$64 >> 2] = $59;
    var $R_1 = $55;
    label = 18;
    break;
   case 10:
    _abort();
   case 11:
    var $67 = $v_0 + 20 | 0;
    var $68 = HEAP32[$67 >> 2];
    var $69 = ($68 | 0) == 0;
    if ($69) {
      label = 12;
      break;
    } else {
      var $R_0 = $68;
      var $RP_0 = $67;
      label = 13;
      break;
    }
   case 12:
    var $71 = $v_0 + 16 | 0;
    var $72 = HEAP32[$71 >> 2];
    var $73 = ($72 | 0) == 0;
    if ($73) {
      var $R_1 = 0;
      label = 18;
      break;
    } else {
      var $R_0 = $72;
      var $RP_0 = $71;
      label = 13;
      break;
    }
   case 13:
    var $RP_0;
    var $R_0;
    var $74 = $R_0 + 20 | 0;
    var $75 = HEAP32[$74 >> 2];
    var $76 = ($75 | 0) == 0;
    if ($76) {
      label = 14;
      break;
    } else {
      var $R_0 = $75;
      var $RP_0 = $74;
      label = 13;
      break;
    }
   case 14:
    var $78 = $R_0 + 16 | 0;
    var $79 = HEAP32[$78 >> 2];
    var $80 = ($79 | 0) == 0;
    if ($80) {
      label = 15;
      break;
    } else {
      var $R_0 = $79;
      var $RP_0 = $78;
      label = 13;
      break;
    }
   case 15:
    var $82 = $RP_0;
    var $83 = $82 >>> 0 < $47 >>> 0;
    if ($83) {
      label = 17;
      break;
    } else {
      label = 16;
      break;
    }
   case 16:
    HEAP32[$RP_0 >> 2] = 0;
    var $R_1 = $R_0;
    label = 18;
    break;
   case 17:
    _abort();
   case 18:
    var $R_1;
    var $87 = ($53 | 0) == 0;
    if ($87) {
      label = 38;
      break;
    } else {
      label = 19;
      break;
    }
   case 19:
    var $89 = $v_0 + 28 | 0;
    var $90 = HEAP32[$89 >> 2];
    var $91 = 5246436 + ($90 << 2) | 0;
    var $92 = HEAP32[$91 >> 2];
    var $93 = ($v_0 | 0) == ($92 | 0);
    if ($93) {
      label = 20;
      break;
    } else {
      label = 22;
      break;
    }
   case 20:
    HEAP32[$91 >> 2] = $R_1;
    var $cond = ($R_1 | 0) == 0;
    if ($cond) {
      label = 21;
      break;
    } else {
      label = 28;
      break;
    }
   case 21:
    var $95 = HEAP32[$89 >> 2];
    var $96 = 1 << $95;
    var $97 = $96 ^ -1;
    var $98 = HEAP32[5246136 >> 2];
    var $99 = $98 & $97;
    HEAP32[5246136 >> 2] = $99;
    label = 38;
    break;
   case 22:
    var $101 = $53;
    var $102 = HEAP32[5246148 >> 2];
    var $103 = $101 >>> 0 < $102 >>> 0;
    if ($103) {
      label = 26;
      break;
    } else {
      label = 23;
      break;
    }
   case 23:
    var $105 = $53 + 16 | 0;
    var $106 = HEAP32[$105 >> 2];
    var $107 = ($106 | 0) == ($v_0 | 0);
    if ($107) {
      label = 24;
      break;
    } else {
      label = 25;
      break;
    }
   case 24:
    HEAP32[$105 >> 2] = $R_1;
    label = 27;
    break;
   case 25:
    var $110 = $53 + 20 | 0;
    HEAP32[$110 >> 2] = $R_1;
    label = 27;
    break;
   case 26:
    _abort();
   case 27:
    var $113 = ($R_1 | 0) == 0;
    if ($113) {
      label = 38;
      break;
    } else {
      label = 28;
      break;
    }
   case 28:
    var $115 = $R_1;
    var $116 = HEAP32[5246148 >> 2];
    var $117 = $115 >>> 0 < $116 >>> 0;
    if ($117) {
      label = 37;
      break;
    } else {
      label = 29;
      break;
    }
   case 29:
    var $119 = $R_1 + 24 | 0;
    HEAP32[$119 >> 2] = $53;
    var $120 = $v_0 + 16 | 0;
    var $121 = HEAP32[$120 >> 2];
    var $122 = ($121 | 0) == 0;
    if ($122) {
      label = 33;
      break;
    } else {
      label = 30;
      break;
    }
   case 30:
    var $124 = $121;
    var $125 = HEAP32[5246148 >> 2];
    var $126 = $124 >>> 0 < $125 >>> 0;
    if ($126) {
      label = 32;
      break;
    } else {
      label = 31;
      break;
    }
   case 31:
    var $128 = $R_1 + 16 | 0;
    HEAP32[$128 >> 2] = $121;
    var $129 = $121 + 24 | 0;
    HEAP32[$129 >> 2] = $R_1;
    label = 33;
    break;
   case 32:
    _abort();
   case 33:
    var $132 = $v_0 + 20 | 0;
    var $133 = HEAP32[$132 >> 2];
    var $134 = ($133 | 0) == 0;
    if ($134) {
      label = 38;
      break;
    } else {
      label = 34;
      break;
    }
   case 34:
    var $136 = $133;
    var $137 = HEAP32[5246148 >> 2];
    var $138 = $136 >>> 0 < $137 >>> 0;
    if ($138) {
      label = 36;
      break;
    } else {
      label = 35;
      break;
    }
   case 35:
    var $140 = $R_1 + 20 | 0;
    HEAP32[$140 >> 2] = $133;
    var $141 = $133 + 24 | 0;
    HEAP32[$141 >> 2] = $R_1;
    label = 38;
    break;
   case 36:
    _abort();
   case 37:
    _abort();
   case 38:
    var $145 = $rsize_0 >>> 0 < 16;
    if ($145) {
      label = 39;
      break;
    } else {
      label = 40;
      break;
    }
   case 39:
    var $147 = $rsize_0 + 32 | 0;
    var $148 = $147 | 3;
    var $149 = $v_0 + 4 | 0;
    HEAP32[$149 >> 2] = $148;
    var $_sum4 = $rsize_0 + 36 | 0;
    var $150 = $46 + $_sum4 | 0;
    var $151 = $150;
    var $152 = HEAP32[$151 >> 2];
    var $153 = $152 | 1;
    HEAP32[$151 >> 2] = $153;
    label = 47;
    break;
   case 40:
    var $155 = $v_0 + 4 | 0;
    HEAP32[$155 >> 2] = 35;
    var $156 = $rsize_0 | 1;
    var $157 = $v_0 + 36 | 0;
    HEAP32[$157 >> 2] = $156;
    var $_sum1 = $rsize_0 + 32 | 0;
    var $158 = $46 + $_sum1 | 0;
    var $159 = $158;
    HEAP32[$159 >> 2] = $rsize_0;
    var $160 = HEAP32[5246140 >> 2];
    var $161 = ($160 | 0) == 0;
    if ($161) {
      label = 46;
      break;
    } else {
      label = 41;
      break;
    }
   case 41:
    var $163 = HEAP32[5246152 >> 2];
    var $164 = $160 >>> 3;
    var $165 = $164 << 1;
    var $166 = 5246172 + ($165 << 2) | 0;
    var $167 = $166;
    var $168 = HEAP32[5246132 >> 2];
    var $169 = 1 << $164;
    var $170 = $168 & $169;
    var $171 = ($170 | 0) == 0;
    if ($171) {
      label = 42;
      break;
    } else {
      label = 43;
      break;
    }
   case 42:
    var $173 = $168 | $169;
    HEAP32[5246132 >> 2] = $173;
    var $_sum2_pre = $165 + 2 | 0;
    var $_pre = 5246172 + ($_sum2_pre << 2) | 0;
    var $F1_0 = $167;
    var $_pre_phi = $_pre;
    label = 45;
    break;
   case 43:
    var $_sum3 = $165 + 2 | 0;
    var $175 = 5246172 + ($_sum3 << 2) | 0;
    var $176 = HEAP32[$175 >> 2];
    var $177 = $176;
    var $178 = HEAP32[5246148 >> 2];
    var $179 = $177 >>> 0 < $178 >>> 0;
    if ($179) {
      label = 44;
      break;
    } else {
      var $F1_0 = $176;
      var $_pre_phi = $175;
      label = 45;
      break;
    }
   case 44:
    _abort();
   case 45:
    var $_pre_phi;
    var $F1_0;
    HEAP32[$_pre_phi >> 2] = $163;
    var $182 = $F1_0 + 12 | 0;
    HEAP32[$182 >> 2] = $163;
    var $183 = $163 + 8 | 0;
    HEAP32[$183 >> 2] = $F1_0;
    var $184 = $163 + 12 | 0;
    HEAP32[$184 >> 2] = $167;
    label = 46;
    break;
   case 46:
    HEAP32[5246140 >> 2] = $rsize_0;
    HEAP32[5246152 >> 2] = $51;
    label = 47;
    break;
   case 47:
    var $187 = $v_0 + 8 | 0;
    var $188 = $187;
    return $188;
   case 48:
    _abort();
  }
}
_tmalloc_small["X"] = 1;
function _init_mparams() {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = HEAP32[5243456 >> 2];
    var $2 = ($1 | 0) == 0;
    if ($2) {
      label = 3;
      break;
    } else {
      label = 6;
      break;
    }
   case 3:
    var $4 = _sysconf(8);
    var $5 = $4 - 1 | 0;
    var $6 = $5 & $4;
    var $7 = ($6 | 0) == 0;
    if ($7) {
      label = 5;
      break;
    } else {
      label = 4;
      break;
    }
   case 4:
    _abort();
   case 5:
    HEAP32[5243464 >> 2] = $4;
    HEAP32[5243460 >> 2] = $4;
    HEAP32[5243468 >> 2] = -1;
    HEAP32[5243472 >> 2] = 2097152;
    HEAP32[5243476 >> 2] = 0;
    HEAP32[5246572 >> 2] = 0;
    var $10 = _time(0);
    var $11 = $10 & -16;
    var $12 = $11 ^ 1431655768;
    HEAP32[5243456 >> 2] = $12;
    label = 6;
    break;
   case 6:
    return;
  }
}
function _prepend_alloc($newbase, $oldbase) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = $newbase + 8 | 0;
    var $2 = $1;
    var $3 = $2 & 7;
    var $4 = ($3 | 0) == 0;
    if ($4) {
      var $9 = 0;
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $6 = -$2 | 0;
    var $7 = $6 & 7;
    var $9 = $7;
    label = 4;
    break;
   case 4:
    var $9;
    var $10 = $newbase + $9 | 0;
    var $11 = $oldbase + 8 | 0;
    var $12 = $11;
    var $13 = $12 & 7;
    var $14 = ($13 | 0) == 0;
    if ($14) {
      var $19 = 0;
      label = 6;
      break;
    } else {
      label = 5;
      break;
    }
   case 5:
    var $16 = -$12 | 0;
    var $17 = $16 & 7;
    var $19 = $17;
    label = 6;
    break;
   case 6:
    var $19;
    var $20 = $oldbase + $19 | 0;
    var $21 = $20;
    var $22 = $20;
    var $23 = $10;
    var $24 = $22 - $23 | 0;
    var $_sum3 = $9 | 32;
    var $25 = $newbase + $_sum3 | 0;
    var $26 = $25;
    var $27 = $24 - 32 | 0;
    var $_sum1 = $9 + 4 | 0;
    var $28 = $newbase + $_sum1 | 0;
    var $29 = $28;
    HEAP32[$29 >> 2] = 35;
    var $30 = HEAP32[5246156 >> 2];
    var $31 = ($21 | 0) == ($30 | 0);
    if ($31) {
      label = 7;
      break;
    } else {
      label = 8;
      break;
    }
   case 7:
    var $33 = HEAP32[5246144 >> 2];
    var $34 = $33 + $27 | 0;
    HEAP32[5246144 >> 2] = $34;
    HEAP32[5246156 >> 2] = $26;
    var $35 = $34 | 1;
    var $_sum42 = $_sum3 + 4 | 0;
    var $36 = $newbase + $_sum42 | 0;
    var $37 = $36;
    HEAP32[$37 >> 2] = $35;
    label = 75;
    break;
   case 8:
    var $39 = HEAP32[5246152 >> 2];
    var $40 = ($21 | 0) == ($39 | 0);
    if ($40) {
      label = 9;
      break;
    } else {
      label = 10;
      break;
    }
   case 9:
    var $42 = HEAP32[5246140 >> 2];
    var $43 = $42 + $27 | 0;
    HEAP32[5246140 >> 2] = $43;
    HEAP32[5246152 >> 2] = $26;
    var $44 = $43 | 1;
    var $_sum40 = $_sum3 + 4 | 0;
    var $45 = $newbase + $_sum40 | 0;
    var $46 = $45;
    HEAP32[$46 >> 2] = $44;
    var $_sum41 = $43 + $_sum3 | 0;
    var $47 = $newbase + $_sum41 | 0;
    var $48 = $47;
    HEAP32[$48 >> 2] = $43;
    label = 75;
    break;
   case 10:
    var $_sum2 = $19 + 4 | 0;
    var $50 = $oldbase + $_sum2 | 0;
    var $51 = $50;
    var $52 = HEAP32[$51 >> 2];
    var $53 = $52 & 3;
    var $54 = ($53 | 0) == 1;
    if ($54) {
      label = 11;
      break;
    } else {
      var $oldfirst_0 = $21;
      var $qsize_0 = $27;
      label = 52;
      break;
    }
   case 11:
    var $56 = $52 & -8;
    var $57 = $52 >>> 3;
    var $58 = $52 >>> 0 < 256;
    if ($58) {
      label = 12;
      break;
    } else {
      label = 20;
      break;
    }
   case 12:
    var $_sum3738 = $19 | 8;
    var $60 = $oldbase + $_sum3738 | 0;
    var $61 = $60;
    var $62 = HEAP32[$61 >> 2];
    var $_sum39 = $19 + 12 | 0;
    var $63 = $oldbase + $_sum39 | 0;
    var $64 = $63;
    var $65 = HEAP32[$64 >> 2];
    var $66 = ($62 | 0) == ($65 | 0);
    if ($66) {
      label = 13;
      break;
    } else {
      label = 14;
      break;
    }
   case 13:
    var $68 = 1 << $57;
    var $69 = $68 ^ -1;
    var $70 = HEAP32[5246132 >> 2];
    var $71 = $70 & $69;
    HEAP32[5246132 >> 2] = $71;
    label = 51;
    break;
   case 14:
    var $73 = $57 << 1;
    var $74 = 5246172 + ($73 << 2) | 0;
    var $75 = $74;
    var $76 = ($62 | 0) == ($75 | 0);
    if ($76) {
      label = 16;
      break;
    } else {
      label = 15;
      break;
    }
   case 15:
    var $78 = $62;
    var $79 = HEAP32[5246148 >> 2];
    var $80 = $78 >>> 0 < $79 >>> 0;
    if ($80) {
      label = 19;
      break;
    } else {
      label = 16;
      break;
    }
   case 16:
    var $82 = ($65 | 0) == ($75 | 0);
    if ($82) {
      label = 18;
      break;
    } else {
      label = 17;
      break;
    }
   case 17:
    var $84 = $65;
    var $85 = HEAP32[5246148 >> 2];
    var $86 = $84 >>> 0 < $85 >>> 0;
    if ($86) {
      label = 19;
      break;
    } else {
      label = 18;
      break;
    }
   case 18:
    var $87 = $62 + 12 | 0;
    HEAP32[$87 >> 2] = $65;
    var $88 = $65 + 8 | 0;
    HEAP32[$88 >> 2] = $62;
    label = 51;
    break;
   case 19:
    _abort();
   case 20:
    var $90 = $20;
    var $_sum34 = $19 | 24;
    var $91 = $oldbase + $_sum34 | 0;
    var $92 = $91;
    var $93 = HEAP32[$92 >> 2];
    var $_sum5 = $19 + 12 | 0;
    var $94 = $oldbase + $_sum5 | 0;
    var $95 = $94;
    var $96 = HEAP32[$95 >> 2];
    var $97 = ($96 | 0) == ($90 | 0);
    if ($97) {
      label = 24;
      break;
    } else {
      label = 21;
      break;
    }
   case 21:
    var $_sum3536 = $19 | 8;
    var $99 = $oldbase + $_sum3536 | 0;
    var $100 = $99;
    var $101 = HEAP32[$100 >> 2];
    var $102 = $101;
    var $103 = HEAP32[5246148 >> 2];
    var $104 = $102 >>> 0 < $103 >>> 0;
    if ($104) {
      label = 23;
      break;
    } else {
      label = 22;
      break;
    }
   case 22:
    var $106 = $101 + 12 | 0;
    HEAP32[$106 >> 2] = $96;
    var $107 = $96 + 8 | 0;
    HEAP32[$107 >> 2] = $101;
    var $R_1 = $96;
    label = 31;
    break;
   case 23:
    _abort();
   case 24:
    var $_sum67 = $19 | 16;
    var $_sum8 = $_sum67 + 4 | 0;
    var $110 = $oldbase + $_sum8 | 0;
    var $111 = $110;
    var $112 = HEAP32[$111 >> 2];
    var $113 = ($112 | 0) == 0;
    if ($113) {
      label = 25;
      break;
    } else {
      var $R_0 = $112;
      var $RP_0 = $111;
      label = 26;
      break;
    }
   case 25:
    var $115 = $oldbase + $_sum67 | 0;
    var $116 = $115;
    var $117 = HEAP32[$116 >> 2];
    var $118 = ($117 | 0) == 0;
    if ($118) {
      var $R_1 = 0;
      label = 31;
      break;
    } else {
      var $R_0 = $117;
      var $RP_0 = $116;
      label = 26;
      break;
    }
   case 26:
    var $RP_0;
    var $R_0;
    var $119 = $R_0 + 20 | 0;
    var $120 = HEAP32[$119 >> 2];
    var $121 = ($120 | 0) == 0;
    if ($121) {
      label = 27;
      break;
    } else {
      var $R_0 = $120;
      var $RP_0 = $119;
      label = 26;
      break;
    }
   case 27:
    var $123 = $R_0 + 16 | 0;
    var $124 = HEAP32[$123 >> 2];
    var $125 = ($124 | 0) == 0;
    if ($125) {
      label = 28;
      break;
    } else {
      var $R_0 = $124;
      var $RP_0 = $123;
      label = 26;
      break;
    }
   case 28:
    var $127 = $RP_0;
    var $128 = HEAP32[5246148 >> 2];
    var $129 = $127 >>> 0 < $128 >>> 0;
    if ($129) {
      label = 30;
      break;
    } else {
      label = 29;
      break;
    }
   case 29:
    HEAP32[$RP_0 >> 2] = 0;
    var $R_1 = $R_0;
    label = 31;
    break;
   case 30:
    _abort();
   case 31:
    var $R_1;
    var $133 = ($93 | 0) == 0;
    if ($133) {
      label = 51;
      break;
    } else {
      label = 32;
      break;
    }
   case 32:
    var $_sum30 = $19 + 28 | 0;
    var $135 = $oldbase + $_sum30 | 0;
    var $136 = $135;
    var $137 = HEAP32[$136 >> 2];
    var $138 = 5246436 + ($137 << 2) | 0;
    var $139 = HEAP32[$138 >> 2];
    var $140 = ($90 | 0) == ($139 | 0);
    if ($140) {
      label = 33;
      break;
    } else {
      label = 35;
      break;
    }
   case 33:
    HEAP32[$138 >> 2] = $R_1;
    var $cond = ($R_1 | 0) == 0;
    if ($cond) {
      label = 34;
      break;
    } else {
      label = 41;
      break;
    }
   case 34:
    var $142 = HEAP32[$136 >> 2];
    var $143 = 1 << $142;
    var $144 = $143 ^ -1;
    var $145 = HEAP32[5246136 >> 2];
    var $146 = $145 & $144;
    HEAP32[5246136 >> 2] = $146;
    label = 51;
    break;
   case 35:
    var $148 = $93;
    var $149 = HEAP32[5246148 >> 2];
    var $150 = $148 >>> 0 < $149 >>> 0;
    if ($150) {
      label = 39;
      break;
    } else {
      label = 36;
      break;
    }
   case 36:
    var $152 = $93 + 16 | 0;
    var $153 = HEAP32[$152 >> 2];
    var $154 = ($153 | 0) == ($90 | 0);
    if ($154) {
      label = 37;
      break;
    } else {
      label = 38;
      break;
    }
   case 37:
    HEAP32[$152 >> 2] = $R_1;
    label = 40;
    break;
   case 38:
    var $157 = $93 + 20 | 0;
    HEAP32[$157 >> 2] = $R_1;
    label = 40;
    break;
   case 39:
    _abort();
   case 40:
    var $160 = ($R_1 | 0) == 0;
    if ($160) {
      label = 51;
      break;
    } else {
      label = 41;
      break;
    }
   case 41:
    var $162 = $R_1;
    var $163 = HEAP32[5246148 >> 2];
    var $164 = $162 >>> 0 < $163 >>> 0;
    if ($164) {
      label = 50;
      break;
    } else {
      label = 42;
      break;
    }
   case 42:
    var $166 = $R_1 + 24 | 0;
    HEAP32[$166 >> 2] = $93;
    var $_sum3132 = $19 | 16;
    var $167 = $oldbase + $_sum3132 | 0;
    var $168 = $167;
    var $169 = HEAP32[$168 >> 2];
    var $170 = ($169 | 0) == 0;
    if ($170) {
      label = 46;
      break;
    } else {
      label = 43;
      break;
    }
   case 43:
    var $172 = $169;
    var $173 = HEAP32[5246148 >> 2];
    var $174 = $172 >>> 0 < $173 >>> 0;
    if ($174) {
      label = 45;
      break;
    } else {
      label = 44;
      break;
    }
   case 44:
    var $176 = $R_1 + 16 | 0;
    HEAP32[$176 >> 2] = $169;
    var $177 = $169 + 24 | 0;
    HEAP32[$177 >> 2] = $R_1;
    label = 46;
    break;
   case 45:
    _abort();
   case 46:
    var $_sum33 = $_sum3132 + 4 | 0;
    var $180 = $oldbase + $_sum33 | 0;
    var $181 = $180;
    var $182 = HEAP32[$181 >> 2];
    var $183 = ($182 | 0) == 0;
    if ($183) {
      label = 51;
      break;
    } else {
      label = 47;
      break;
    }
   case 47:
    var $185 = $182;
    var $186 = HEAP32[5246148 >> 2];
    var $187 = $185 >>> 0 < $186 >>> 0;
    if ($187) {
      label = 49;
      break;
    } else {
      label = 48;
      break;
    }
   case 48:
    var $189 = $R_1 + 20 | 0;
    HEAP32[$189 >> 2] = $182;
    var $190 = $182 + 24 | 0;
    HEAP32[$190 >> 2] = $R_1;
    label = 51;
    break;
   case 49:
    _abort();
   case 50:
    _abort();
   case 51:
    var $_sum9 = $56 | $19;
    var $194 = $oldbase + $_sum9 | 0;
    var $195 = $194;
    var $196 = $56 + $27 | 0;
    var $oldfirst_0 = $195;
    var $qsize_0 = $196;
    label = 52;
    break;
   case 52:
    var $qsize_0;
    var $oldfirst_0;
    var $198 = $oldfirst_0 + 4 | 0;
    var $199 = HEAP32[$198 >> 2];
    var $200 = $199 & -2;
    HEAP32[$198 >> 2] = $200;
    var $201 = $qsize_0 | 1;
    var $_sum10 = $_sum3 + 4 | 0;
    var $202 = $newbase + $_sum10 | 0;
    var $203 = $202;
    HEAP32[$203 >> 2] = $201;
    var $_sum11 = $qsize_0 + $_sum3 | 0;
    var $204 = $newbase + $_sum11 | 0;
    var $205 = $204;
    HEAP32[$205 >> 2] = $qsize_0;
    var $206 = $qsize_0 >>> 3;
    var $207 = $qsize_0 >>> 0 < 256;
    if ($207) {
      label = 53;
      break;
    } else {
      label = 58;
      break;
    }
   case 53:
    var $209 = $206 << 1;
    var $210 = 5246172 + ($209 << 2) | 0;
    var $211 = $210;
    var $212 = HEAP32[5246132 >> 2];
    var $213 = 1 << $206;
    var $214 = $212 & $213;
    var $215 = ($214 | 0) == 0;
    if ($215) {
      label = 54;
      break;
    } else {
      label = 55;
      break;
    }
   case 54:
    var $217 = $212 | $213;
    HEAP32[5246132 >> 2] = $217;
    var $_sum26_pre = $209 + 2 | 0;
    var $_pre = 5246172 + ($_sum26_pre << 2) | 0;
    var $F4_0 = $211;
    var $_pre_phi = $_pre;
    label = 57;
    break;
   case 55:
    var $_sum29 = $209 + 2 | 0;
    var $219 = 5246172 + ($_sum29 << 2) | 0;
    var $220 = HEAP32[$219 >> 2];
    var $221 = $220;
    var $222 = HEAP32[5246148 >> 2];
    var $223 = $221 >>> 0 < $222 >>> 0;
    if ($223) {
      label = 56;
      break;
    } else {
      var $F4_0 = $220;
      var $_pre_phi = $219;
      label = 57;
      break;
    }
   case 56:
    _abort();
   case 57:
    var $_pre_phi;
    var $F4_0;
    HEAP32[$_pre_phi >> 2] = $26;
    var $226 = $F4_0 + 12 | 0;
    HEAP32[$226 >> 2] = $26;
    var $_sum2711 = $9 | 40;
    var $227 = $newbase + $_sum2711 | 0;
    var $228 = $227;
    HEAP32[$228 >> 2] = $F4_0;
    var $_sum28 = $_sum3 + 12 | 0;
    var $229 = $newbase + $_sum28 | 0;
    var $230 = $229;
    HEAP32[$230 >> 2] = $211;
    label = 75;
    break;
   case 58:
    var $232 = $25;
    var $233 = $qsize_0 >>> 8;
    var $234 = ($233 | 0) == 0;
    if ($234) {
      var $I7_0 = 0;
      label = 61;
      break;
    } else {
      label = 59;
      break;
    }
   case 59:
    var $236 = $qsize_0 >>> 0 > 16777215;
    if ($236) {
      var $I7_0 = 31;
      label = 61;
      break;
    } else {
      label = 60;
      break;
    }
   case 60:
    var $238 = $233 + 1048320 | 0;
    var $239 = $238 >>> 16;
    var $240 = $239 & 8;
    var $241 = $233 << $240;
    var $242 = $241 + 520192 | 0;
    var $243 = $242 >>> 16;
    var $244 = $243 & 4;
    var $245 = $244 | $240;
    var $246 = $241 << $244;
    var $247 = $246 + 245760 | 0;
    var $248 = $247 >>> 16;
    var $249 = $248 & 2;
    var $250 = $245 | $249;
    var $251 = 14 - $250 | 0;
    var $252 = $246 << $249;
    var $253 = $252 >>> 15;
    var $254 = $251 + $253 | 0;
    var $255 = $254 << 1;
    var $256 = $254 + 7 | 0;
    var $257 = $qsize_0 >>> ($256 >>> 0);
    var $258 = $257 & 1;
    var $259 = $258 | $255;
    var $I7_0 = $259;
    label = 61;
    break;
   case 61:
    var $I7_0;
    var $261 = 5246436 + ($I7_0 << 2) | 0;
    var $_sum12 = $_sum3 + 28 | 0;
    var $262 = $newbase + $_sum12 | 0;
    var $263 = $262;
    HEAP32[$263 >> 2] = $I7_0;
    var $_sum134 = $9 | 48;
    var $264 = $newbase + $_sum134 | 0;
    var $_sum14 = $_sum3 + 20 | 0;
    var $265 = $newbase + $_sum14 | 0;
    var $266 = $265;
    HEAP32[$266 >> 2] = 0;
    var $267 = $264;
    HEAP32[$267 >> 2] = 0;
    var $268 = HEAP32[5246136 >> 2];
    var $269 = 1 << $I7_0;
    var $270 = $268 & $269;
    var $271 = ($270 | 0) == 0;
    if ($271) {
      label = 62;
      break;
    } else {
      label = 63;
      break;
    }
   case 62:
    var $273 = $268 | $269;
    HEAP32[5246136 >> 2] = $273;
    HEAP32[$261 >> 2] = $232;
    var $274 = $261;
    var $_sum159 = $9 | 56;
    var $275 = $newbase + $_sum159 | 0;
    var $276 = $275;
    HEAP32[$276 >> 2] = $274;
    var $_sum16 = $_sum3 + 12 | 0;
    var $277 = $newbase + $_sum16 | 0;
    var $278 = $277;
    HEAP32[$278 >> 2] = $232;
    var $_sum1710 = $9 | 40;
    var $279 = $newbase + $_sum1710 | 0;
    var $280 = $279;
    HEAP32[$280 >> 2] = $232;
    label = 75;
    break;
   case 63:
    var $282 = HEAP32[$261 >> 2];
    var $283 = ($I7_0 | 0) == 31;
    if ($283) {
      var $288 = 0;
      label = 65;
      break;
    } else {
      label = 64;
      break;
    }
   case 64:
    var $285 = $I7_0 >>> 1;
    var $286 = 25 - $285 | 0;
    var $288 = $286;
    label = 65;
    break;
   case 65:
    var $288;
    var $289 = $qsize_0 << $288;
    var $K8_0 = $289;
    var $T_0 = $282;
    label = 66;
    break;
   case 66:
    var $T_0;
    var $K8_0;
    var $291 = $T_0 + 4 | 0;
    var $292 = HEAP32[$291 >> 2];
    var $293 = $292 & -8;
    var $294 = ($293 | 0) == ($qsize_0 | 0);
    if ($294) {
      label = 71;
      break;
    } else {
      label = 67;
      break;
    }
   case 67:
    var $296 = $K8_0 >>> 31;
    var $297 = $T_0 + 16 + ($296 << 2) | 0;
    var $298 = HEAP32[$297 >> 2];
    var $299 = ($298 | 0) == 0;
    var $300 = $K8_0 << 1;
    if ($299) {
      label = 68;
      break;
    } else {
      var $K8_0 = $300;
      var $T_0 = $298;
      label = 66;
      break;
    }
   case 68:
    var $302 = $297;
    var $303 = HEAP32[5246148 >> 2];
    var $304 = $302 >>> 0 < $303 >>> 0;
    if ($304) {
      label = 70;
      break;
    } else {
      label = 69;
      break;
    }
   case 69:
    HEAP32[$297 >> 2] = $232;
    var $_sum235 = $9 | 56;
    var $306 = $newbase + $_sum235 | 0;
    var $307 = $306;
    HEAP32[$307 >> 2] = $T_0;
    var $_sum24 = $_sum3 + 12 | 0;
    var $308 = $newbase + $_sum24 | 0;
    var $309 = $308;
    HEAP32[$309 >> 2] = $232;
    var $_sum256 = $9 | 40;
    var $310 = $newbase + $_sum256 | 0;
    var $311 = $310;
    HEAP32[$311 >> 2] = $232;
    label = 75;
    break;
   case 70:
    _abort();
   case 71:
    var $314 = $T_0 + 8 | 0;
    var $315 = HEAP32[$314 >> 2];
    var $316 = $T_0;
    var $317 = HEAP32[5246148 >> 2];
    var $318 = $316 >>> 0 < $317 >>> 0;
    if ($318) {
      label = 74;
      break;
    } else {
      label = 72;
      break;
    }
   case 72:
    var $320 = $315;
    var $321 = $320 >>> 0 < $317 >>> 0;
    if ($321) {
      label = 74;
      break;
    } else {
      label = 73;
      break;
    }
   case 73:
    var $323 = $315 + 12 | 0;
    HEAP32[$323 >> 2] = $232;
    HEAP32[$314 >> 2] = $232;
    var $_sum207 = $9 | 40;
    var $324 = $newbase + $_sum207 | 0;
    var $325 = $324;
    HEAP32[$325 >> 2] = $315;
    var $_sum21 = $_sum3 + 12 | 0;
    var $326 = $newbase + $_sum21 | 0;
    var $327 = $326;
    HEAP32[$327 >> 2] = $T_0;
    var $_sum228 = $9 | 56;
    var $328 = $newbase + $_sum228 | 0;
    var $329 = $328;
    HEAP32[$329 >> 2] = 0;
    label = 75;
    break;
   case 74:
    _abort();
   case 75:
    var $_sum1819 = $9 | 8;
    var $331 = $newbase + $_sum1819 | 0;
    return $331;
  }
}
_prepend_alloc["X"] = 1;
function _add_segment($tbase, $tsize) {
  var label = 0;
  label = 2;
  while (1) switch (label) {
   case 2:
    var $1 = HEAP32[5246156 >> 2];
    var $2 = $1;
    var $3 = _segment_holding($2);
    var $4 = $3 | 0;
    var $5 = HEAP32[$4 >> 2];
    var $6 = $3 + 4 | 0;
    var $7 = HEAP32[$6 >> 2];
    var $8 = $5 + $7 | 0;
    var $_sum = $7 - 47 | 0;
    var $_sum1 = $7 - 39 | 0;
    var $9 = $5 + $_sum1 | 0;
    var $10 = $9;
    var $11 = $10 & 7;
    var $12 = ($11 | 0) == 0;
    if ($12) {
      var $17 = 0;
      label = 4;
      break;
    } else {
      label = 3;
      break;
    }
   case 3:
    var $14 = -$10 | 0;
    var $15 = $14 & 7;
    var $17 = $15;
    label = 4;
    break;
   case 4:
    var $17;
    var $_sum2 = $_sum + $17 | 0;
    var $18 = $5 + $_sum2 | 0;
    var $19 = $1 + 16 | 0;
    var $20 = $19;
    var $21 = $18 >>> 0 < $20 >>> 0;
    var $22 = $21 ? $2 : $18;
    var $23 = $22 + 8 | 0;
    var $24 = $23;
    var $25 = $tbase;
    var $26 = $tsize - 40 | 0;
    _init_top($25, $26);
    var $27 = $22 + 4 | 0;
    var $28 = $27;
    HEAP32[$28 >> 2] = 27;
    HEAP32[$23 >> 2] = HEAP32[5246576 >> 2];
    HEAP32[$23 + 4 >> 2] = HEAP32[5246580 >> 2];
    HEAP32[$23 + 8 >> 2] = HEAP32[5246584 >> 2];
    HEAP32[$23 + 12 >> 2] = HEAP32[5246588 >> 2];
    HEAP32[5246576 >> 2] = $tbase;
    HEAP32[5246580 >> 2] = $tsize;
    HEAP32[5246588 >> 2] = 0;
    HEAP32[5246584 >> 2] = $24;
    var $29 = $22 + 28 | 0;
    var $30 = $29;
    HEAP32[$30 >> 2] = 7;
    var $31 = $22 + 32 | 0;
    var $32 = $31 >>> 0 < $8 >>> 0;
    if ($32) {
      var $33 = $30;
      label = 5;
      break;
    } else {
      label = 6;
      break;
    }
   case 5:
    var $33;
    var $34 = $33 + 4 | 0;
    HEAP32[$34 >> 2] = 7;
    var $35 = $33 + 8 | 0;
    var $36 = $35;
    var $37 = $36 >>> 0 < $8 >>> 0;
    if ($37) {
      var $33 = $34;
      label = 5;
      break;
    } else {
      label = 6;
      break;
    }
   case 6:
    var $38 = ($22 | 0) == ($2 | 0);
    if ($38) {
      label = 30;
      break;
    } else {
      label = 7;
      break;
    }
   case 7:
    var $40 = $22;
    var $41 = $1;
    var $42 = $40 - $41 | 0;
    var $43 = $2 + $42 | 0;
    var $_sum3 = $42 + 4 | 0;
    var $44 = $2 + $_sum3 | 0;
    var $45 = $44;
    var $46 = HEAP32[$45 >> 2];
    var $47 = $46 & -2;
    HEAP32[$45 >> 2] = $47;
    var $48 = $42 | 1;
    var $49 = $1 + 4 | 0;
    HEAP32[$49 >> 2] = $48;
    var $50 = $43;
    HEAP32[$50 >> 2] = $42;
    var $51 = $42 >>> 3;
    var $52 = $42 >>> 0 < 256;
    if ($52) {
      label = 8;
      break;
    } else {
      label = 13;
      break;
    }
   case 8:
    var $54 = $51 << 1;
    var $55 = 5246172 + ($54 << 2) | 0;
    var $56 = $55;
    var $57 = HEAP32[5246132 >> 2];
    var $58 = 1 << $51;
    var $59 = $57 & $58;
    var $60 = ($59 | 0) == 0;
    if ($60) {
      label = 9;
      break;
    } else {
      label = 10;
      break;
    }
   case 9:
    var $62 = $57 | $58;
    HEAP32[5246132 >> 2] = $62;
    var $_sum10_pre = $54 + 2 | 0;
    var $_pre = 5246172 + ($_sum10_pre << 2) | 0;
    var $F_0 = $56;
    var $_pre_phi = $_pre;
    label = 12;
    break;
   case 10:
    var $_sum11 = $54 + 2 | 0;
    var $64 = 5246172 + ($_sum11 << 2) | 0;
    var $65 = HEAP32[$64 >> 2];
    var $66 = $65;
    var $67 = HEAP32[5246148 >> 2];
    var $68 = $66 >>> 0 < $67 >>> 0;
    if ($68) {
      label = 11;
      break;
    } else {
      var $F_0 = $65;
      var $_pre_phi = $64;
      label = 12;
      break;
    }
   case 11:
    _abort();
   case 12:
    var $_pre_phi;
    var $F_0;
    HEAP32[$_pre_phi >> 2] = $1;
    var $71 = $F_0 + 12 | 0;
    HEAP32[$71 >> 2] = $1;
    var $72 = $1 + 8 | 0;
    HEAP32[$72 >> 2] = $F_0;
    var $73 = $1 + 12 | 0;
    HEAP32[$73 >> 2] = $56;
    label = 30;
    break;
   case 13:
    var $75 = $1;
    var $76 = $42 >>> 8;
    var $77 = ($76 | 0) == 0;
    if ($77) {
      var $I1_0 = 0;
      label = 16;
      break;
    } else {
      label = 14;
      break;
    }
   case 14:
    var $79 = $42 >>> 0 > 16777215;
    if ($79) {
      var $I1_0 = 31;
      label = 16;
      break;
    } else {
      label = 15;
      break;
    }
   case 15:
    var $81 = $76 + 1048320 | 0;
    var $82 = $81 >>> 16;
    var $83 = $82 & 8;
    var $84 = $76 << $83;
    var $85 = $84 + 520192 | 0;
    var $86 = $85 >>> 16;
    var $87 = $86 & 4;
    var $88 = $87 | $83;
    var $89 = $84 << $87;
    var $90 = $89 + 245760 | 0;
    var $91 = $90 >>> 16;
    var $92 = $91 & 2;
    var $93 = $88 | $92;
    var $94 = 14 - $93 | 0;
    var $95 = $89 << $92;
    var $96 = $95 >>> 15;
    var $97 = $94 + $96 | 0;
    var $98 = $97 << 1;
    var $99 = $97 + 7 | 0;
    var $100 = $42 >>> ($99 >>> 0);
    var $101 = $100 & 1;
    var $102 = $101 | $98;
    var $I1_0 = $102;
    label = 16;
    break;
   case 16:
    var $I1_0;
    var $104 = 5246436 + ($I1_0 << 2) | 0;
    var $105 = $1 + 28 | 0;
    var $I1_0_c = $I1_0;
    HEAP32[$105 >> 2] = $I1_0_c;
    var $106 = $1 + 20 | 0;
    HEAP32[$106 >> 2] = 0;
    var $107 = $1 + 16 | 0;
    HEAP32[$107 >> 2] = 0;
    var $108 = HEAP32[5246136 >> 2];
    var $109 = 1 << $I1_0;
    var $110 = $108 & $109;
    var $111 = ($110 | 0) == 0;
    if ($111) {
      label = 17;
      break;
    } else {
      label = 18;
      break;
    }
   case 17:
    var $113 = $108 | $109;
    HEAP32[5246136 >> 2] = $113;
    HEAP32[$104 >> 2] = $75;
    var $114 = $1 + 24 | 0;
    var $_c = $104;
    HEAP32[$114 >> 2] = $_c;
    var $115 = $1 + 12 | 0;
    HEAP32[$115 >> 2] = $1;
    var $116 = $1 + 8 | 0;
    HEAP32[$116 >> 2] = $1;
    label = 30;
    break;
   case 18:
    var $118 = HEAP32[$104 >> 2];
    var $119 = ($I1_0 | 0) == 31;
    if ($119) {
      var $124 = 0;
      label = 20;
      break;
    } else {
      label = 19;
      break;
    }
   case 19:
    var $121 = $I1_0 >>> 1;
    var $122 = 25 - $121 | 0;
    var $124 = $122;
    label = 20;
    break;
   case 20:
    var $124;
    var $125 = $42 << $124;
    var $K2_0 = $125;
    var $T_0 = $118;
    label = 21;
    break;
   case 21:
    var $T_0;
    var $K2_0;
    var $127 = $T_0 + 4 | 0;
    var $128 = HEAP32[$127 >> 2];
    var $129 = $128 & -8;
    var $130 = ($129 | 0) == ($42 | 0);
    if ($130) {
      label = 26;
      break;
    } else {
      label = 22;
      break;
    }
   case 22:
    var $132 = $K2_0 >>> 31;
    var $133 = $T_0 + 16 + ($132 << 2) | 0;
    var $134 = HEAP32[$133 >> 2];
    var $135 = ($134 | 0) == 0;
    var $136 = $K2_0 << 1;
    if ($135) {
      label = 23;
      break;
    } else {
      var $K2_0 = $136;
      var $T_0 = $134;
      label = 21;
      break;
    }
   case 23:
    var $138 = $133;
    var $139 = HEAP32[5246148 >> 2];
    var $140 = $138 >>> 0 < $139 >>> 0;
    if ($140) {
      label = 25;
      break;
    } else {
      label = 24;
      break;
    }
   case 24:
    HEAP32[$133 >> 2] = $75;
    var $142 = $1 + 24 | 0;
    var $T_0_c7 = $T_0;
    HEAP32[$142 >> 2] = $T_0_c7;
    var $143 = $1 + 12 | 0;
    HEAP32[$143 >> 2] = $1;
    var $144 = $1 + 8 | 0;
    HEAP32[$144 >> 2] = $1;
    label = 30;
    break;
   case 25:
    _abort();
   case 26:
    var $147 = $T_0 + 8 | 0;
    var $148 = HEAP32[$147 >> 2];
    var $149 = $T_0;
    var $150 = HEAP32[5246148 >> 2];
    var $151 = $149 >>> 0 < $150 >>> 0;
    if ($151) {
      label = 29;
      break;
    } else {
      label = 27;
      break;
    }
   case 27:
    var $153 = $148;
    var $154 = $153 >>> 0 < $150 >>> 0;
    if ($154) {
      label = 29;
      break;
    } else {
      label = 28;
      break;
    }
   case 28:
    var $156 = $148 + 12 | 0;
    HEAP32[$156 >> 2] = $75;
    HEAP32[$147 >> 2] = $75;
    var $157 = $1 + 8 | 0;
    var $_c6 = $148;
    HEAP32[$157 >> 2] = $_c6;
    var $158 = $1 + 12 | 0;
    var $T_0_c = $T_0;
    HEAP32[$158 >> 2] = $T_0_c;
    var $159 = $1 + 24 | 0;
    HEAP32[$159 >> 2] = 0;
    label = 30;
    break;
   case 29:
    _abort();
   case 30:
    return;
  }
}



_add_segment["X"]=1;

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    add: function(xl, xh, yl, yh) {
      var x = new goog.math.Long(xl, xh);
      var y = new goog.math.Long(yl, yh);
      var ret = x.add(y);
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    subtract: function(xl, xh, yl, yh) {
      var x = new goog.math.Long(xl, xh);
      var y = new goog.math.Long(yl, yh);
      var ret = x.subtract(y);
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    multiply: function(xl, xh, yl, yh) {
      var x = new goog.math.Long(xl, xh);
      var y = new goog.math.Long(yl, yh);
      var ret = x.multiply(y);
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    divide: function(xl, xh, yl, yh, unsigned) {
      Wrapper.ensureTemps();
      if (!unsigned) {
        var x = new goog.math.Long(xl, xh);
        var y = new goog.math.Long(yl, yh);
        var ret = x.div(y);
        HEAP32[tempDoublePtr>>2] = ret.low_;
        HEAP32[tempDoublePtr+4>>2] = ret.high_;
      } else {
        // slow precise bignum division
        var x = Wrapper.lh2bignum(xl >>> 0, xh >>> 0);
        var y = Wrapper.lh2bignum(yl >>> 0, yh >>> 0);
        var z = new BigInteger();
        x.divRemTo(y, z, null);
        var l = new BigInteger();
        var h = new BigInteger();
        z.divRemTo(Wrapper.two32, h, l);
        HEAP32[tempDoublePtr>>2] = parseInt(l.toString()) | 0;
        HEAP32[tempDoublePtr+4>>2] = parseInt(h.toString()) | 0;
      }
    },
    modulo: function(xl, xh, yl, yh, unsigned) {
      Wrapper.ensureTemps();
      if (!unsigned) {
        var x = new goog.math.Long(xl, xh);
        var y = new goog.math.Long(yl, yh);
        var ret = x.modulo(y);
        HEAP32[tempDoublePtr>>2] = ret.low_;
        HEAP32[tempDoublePtr+4>>2] = ret.high_;
      } else {
        // slow precise bignum division
        var x = Wrapper.lh2bignum(xl >>> 0, xh >>> 0);
        var y = Wrapper.lh2bignum(yl >>> 0, yh >>> 0);
        var z = new BigInteger();
        x.divRemTo(y, null, z);
        var l = new BigInteger();
        var h = new BigInteger();
        z.divRemTo(Wrapper.two32, h, l);
        HEAP32[tempDoublePtr>>2] = parseInt(l.toString()) | 0;
        HEAP32[tempDoublePtr+4>>2] = parseInt(h.toString()) | 0;
      }
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

Module.callMain = function callMain(args) {
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);


  var ret;

  ret = Module['_main'](argc, argv, 0);


  return ret;
}




function run(args) {
  args = args || Module['arguments'];

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }

  function doRun() {
    var ret = 0;
    calledRun = true;
    if (Module['_main']) {
      preMain();
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

initRuntime();

var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

if (shouldRunNow) {
  var ret = run();
}

// {{POST_RUN_ADDITIONS}}






  // {{MODULE_ADDITIONS}}


// EMSCRIPTEN_GENERATED_FUNCTIONS: ["_http_parser_init","_http_errno_name","_http_message_needs_eof","_get_method","_get_http_major","_get_error_description","_tmalloc_small","_http_errno_description","_prepend_alloc","_init_top","_create_parser","_get_upgrade","_get_status_code","_http_method_str","_get_http_minor","_init_mparams","_get_settings","_http_parser_execute","_segment_holding","_get_error_name","_sys_alloc","_add_segment","_init_bins","_malloc","_http_should_keep_alive","_parse_url_char"]



  // {parser.js}

  // Importing used functions
  var http_parser_execute    = Module.cwrap('http_parser_execute', 'number', ['number', 'number', 'number', 'number'])
    , create_parser          = Module.cwrap('create_parser', 'number', ['number'])
    , get_error_name         = Module.cwrap('get_error_name', 'string', ['number'])
    , get_error_description  = Module.cwrap('get_error_description', 'string', ['number'])
    , http_should_keep_alive = Module.cwrap('http_should_keep_alive', 'number', ['number'])
    , get_http_major         = Module.cwrap('get_http_major', 'number', ['number'])
    , get_http_minor         = Module.cwrap('get_http_minor', 'number', ['number'])
    , get_status_code        = Module.cwrap('get_status_code', 'number', ['number'])
    , get_method             = Module.cwrap('get_method', 'string', ['number'])
    , get_upgrade            = Module.cwrap('get_upgrade', 'number', ['number'])

  // Parse callbacks (externs in wrapper.c)
  // self must be set before calling http_parser_execute()
  var self
  function _message_begin_cb(parser) {
  }

  function _url_cb(parser, buffer, length) {
    self.info.url = Module.Pointer_stringify(buffer).substr(0, length)
    self.info.method = get_method(parser)
  }

  function _status_complete_cb(parser, buffer, length) {
    self.info.statusCode = get_status_code(parser)
  }

  function _header_field_cb(parser, buffer, length) {
    self.info.headers.push(Module.Pointer_stringify(buffer).substr(0, length))
  }

  function _header_value_cb(parser, buffer, length) {
    self.info.headers.push(Module.Pointer_stringify(buffer).substr(0, length))
  }

  function _headers_complete_cb(parser) {
    var info = self.info
    info.shouldKeepAlive = Boolean(http_should_keep_alive(parser))
    info.versionMajor = get_http_major(parser)
    info.versionMinor = get_http_minor(parser)
    info.httpVersion = info.versionMajor + '.' + info.versionMinor
    self.onHeadersComplete(info)
    self.onHeaders(info.headers, self.url)
  }

  function _body_cb(parser, buffer, length) {
    self.onBody(self.last_buffer, buffer - self.last_buffer_begins, length)
  }

  function _message_complete_cb(parser) {
    self.onMessageComplete()
  }

  // Settings is a static struct pointer. The settings struct references the callbacks above.
  var settings = Module.ccall('get_settings', 'number', [], [])

  // Parser class
  function HTTPParser(type) {
    this.parser = create_parser(type)

    this.info = {
      versionMajor: undefined,
      versionMinor: undefined,
      statusCode: undefined,
      method: undefined,
      url: undefined,
      headers: [],
      shouldKeepAlive: false,
      upgrade: false,
      httpVersion: null
    }
  }

  HTTPParser.prototype = {
    constructor: HTTPParser,
    onHeaders:         function(headers, url) {},
    onHeadersComplete: function(info) {},
    onBody:            function(buffer, offset, length) {},
    onMessageComplete: function() {},

    execute: function execute(data, offset, length) {
      var parsed

      self = this

      this.last_buffer = data.buffer || data

      if (typeof data === 'string') {
        this.last_buffer_begins = Module.allocate(Module.intArrayFromString(data), 'i8', Module.ALLOC_STATIC)
        parsed = http_parser_execute(this.parser, settings, this.last_buffer_begins, data.length)
        //Module._free(this.last_buffer_begins)

      } else {
        var buf = Module._malloc(length)
          , buffer_offset = (data.byteOffset || 0) + (offset || 0)
          , array = new Uint8Array(this.last_buffer, buffer_offset, length)

        this.last_buffer_begins = buf - buffer_offset
        Module.HEAPU8.set(array, buf)
        parsed = http_parser_execute(this.parser, settings, buf, length)
        //Module._free(buf)
      }

      this.info.upgrade = Boolean(get_upgrade(this.parser))

      return parsed
    },

    error: function() {
      var name = get_error_name(this.parser)
        , desc = get_error_description(this.parser)
      return name.length ? (name + ': ' + desc) : null
    }
  }

  HTTPParser.REQUEST = 0
  HTTPParser.RESPONSE = 1
  HTTPParser.BOTH = 2

  return HTTPParser
}))
