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
