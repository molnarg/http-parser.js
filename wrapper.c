#include "http_parser.h"
#include <stdlib.h>

extern int message_begin_cb    (http_parser *p);
extern int url_cb              (http_parser *p, const char *buf, size_t len);
extern int status_complete_cb  (http_parser *p);
extern int header_field_cb     (http_parser *p, const char *buf, size_t len);
extern int header_value_cb     (http_parser *p, const char *buf, size_t len);
extern int headers_complete_cb (http_parser *p);
extern int body_cb             (http_parser *p, const char *buf, size_t len);
extern int message_complete_cb (http_parser *p);

static http_parser_settings settings =
{ .on_message_begin    = message_begin_cb
, .on_url              = url_cb
, .on_status_complete  = status_complete_cb
, .on_header_field     = header_field_cb
, .on_header_value     = header_value_cb
, .on_headers_complete = headers_complete_cb
, .on_body             = body_cb
, .on_message_complete = message_complete_cb
};

http_parser_settings* get_settings ()
{
  return &settings;
}

http_parser* create_parser ( enum http_parser_type type )
{
  http_parser *parser;
  parser = malloc(sizeof(http_parser));
  http_parser_init(parser, type);

  return parser;
}

const char* get_error_name (http_parser* parser)
{
  enum http_errno err = HTTP_PARSER_ERRNO(parser);
  if (!err) return NULL;
  return http_errno_name(err);
}

const char* get_error_description (http_parser* parser)
{
  enum http_errno err = HTTP_PARSER_ERRNO(parser);
  if (!err) return NULL;
  return http_errno_description(err);
}

unsigned short get_http_major(http_parser* parser)
{
  return parser->http_major;
}

unsigned short get_http_minor(http_parser* parser)
{
  return parser->http_minor;
}

unsigned short get_status_code(http_parser* parser)
{
  return parser->status_code;
}

const char* get_method(http_parser* parser)
{
  return http_method_str((enum http_method) parser->method);
}

unsigned char get_upgrade(http_parser* parser)
{
  return parser->upgrade;
}
