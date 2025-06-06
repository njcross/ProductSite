/*
 * Copyright (c) 2009-Present, Redis Ltd.
 * All rights reserved.
 *
 * Licensed under your choice of (a) the Redis Source Available License 2.0
 * (RSALv2); or (b) the Server Side Public License v1 (SSPLv1); or (c) the
 * GNU Affero General Public License v3 (AGPLv3).
 */

/* ----------------------------------------------------------------------------------------
 * A RESP parser for parsing replies returned by RM_Call or Lua's
 * 'redis.call()'.
 *
 * The parser introduces callbacks that need to be set by the user. Each
 * callback represents a different reply type. Each callback gets a p_ctx that
 * was given to the parseReply function. The callbacks also give the protocol
 * (underlying blob) of the current reply and the size.
 *
 * Some callbacks also get the parser object itself:
 * - array_callback
 * - set_callback
 * - map_callback
 * 
 * These callbacks need to continue parsing by calling parseReply a number of
 * times, according to the supplied length. Subsequent parseReply calls may use
 * a different p_ctx, which will be used for nested CallReply objects.
 *
 * These callbacks also do not receive a proto_len, which is not known at the
 * time of parsing. Callers may calculate it themselves after parsing the
 * entire collection.
 *
 * NOTE: This parser is designed to only handle replies generated by Redis
 * itself. It does not perform many required validations and thus NOT SAFE FOR
 * PARSING USER INPUT.
 * ----------------------------------------------------------------------------------------
 */

#include "fast_float_strtod.h"
#include "resp_parser.h"
#include "server.h"

static int parseBulk(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    long long bulklen;
    parser->curr_location = p + 2; /* for \r\n */

    string2ll(proto+1,p-proto-1,&bulklen);
    if (bulklen == -1) {
        parser->callbacks.null_bulk_string_callback(p_ctx, proto, parser->curr_location - proto);
    } else {
        const char *str = parser->curr_location;
        parser->curr_location += bulklen;
        parser->curr_location += 2; /* for \r\n */
        parser->callbacks.bulk_string_callback(p_ctx, str, bulklen, proto, parser->curr_location - proto);
    }

    return C_OK;
}

static int parseSimpleString(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; /* for \r\n */
    parser->callbacks.simple_str_callback(p_ctx, proto+1, p-proto-1, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseError(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; // for \r\n
    parser->callbacks.error_callback(p_ctx, proto+1, p-proto-1, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseLong(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; /* for \r\n */
    long long val;
    string2ll(proto+1,p-proto-1,&val);
    parser->callbacks.long_callback(p_ctx, val, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseAttributes(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    long long len;
    string2ll(proto+1,p-proto-1,&len);
    p += 2;
    parser->curr_location = p;
    parser->callbacks.attribute_callback(parser, p_ctx, len, proto);
    return C_OK;
}

static int parseVerbatimString(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    long long bulklen;
    parser->curr_location = p + 2; /* for \r\n */
    string2ll(proto+1,p-proto-1,&bulklen);
    const char *format = parser->curr_location;
    parser->curr_location += bulklen;
    parser->curr_location += 2; /* for \r\n */
    parser->callbacks.verbatim_string_callback(p_ctx, format, format + 4, bulklen - 4, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseBigNumber(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; /* for \r\n */
    parser->callbacks.big_number_callback(p_ctx, proto+1, p-proto-1, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseNull(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; /* for \r\n */
    parser->callbacks.null_callback(p_ctx, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseDouble(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; /* for \r\n */
    char buf[MAX_LONG_DOUBLE_CHARS+1];
    size_t len = p-proto-1;
    double d;
    if (len <= MAX_LONG_DOUBLE_CHARS) {
        memcpy(buf,proto+1,len);
        buf[len] = '\0';
        d = fast_float_strtod(buf,NULL); /* We expect a valid representation. */
    } else {
        d = 0;
    }
    parser->callbacks.double_callback(p_ctx, d, proto, parser->curr_location - proto);
    return C_OK;
}

static int parseBool(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    parser->curr_location = p + 2; /* for \r\n */
    parser->callbacks.bool_callback(p_ctx, proto[1] == 't', proto, parser->curr_location - proto);
    return C_OK;
}

static int parseArray(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    long long len;
    string2ll(proto+1,p-proto-1,&len);
    p += 2;
    parser->curr_location = p;
    if (len == -1) {
        parser->callbacks.null_array_callback(p_ctx, proto, parser->curr_location - proto);
    } else {
        parser->callbacks.array_callback(parser, p_ctx, len, proto);
    }
    return C_OK;
}

static int parseSet(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    long long len;
    string2ll(proto+1,p-proto-1,&len);
    p += 2;
    parser->curr_location = p;
    parser->callbacks.set_callback(parser, p_ctx, len, proto);
    return C_OK;
}

static int parseMap(ReplyParser *parser, void *p_ctx) {
    const char *proto = parser->curr_location;
    char *p = strchr(proto+1,'\r');
    long long len;
    string2ll(proto+1,p-proto-1,&len);
    p += 2;
    parser->curr_location = p;
    parser->callbacks.map_callback(parser, p_ctx, len, proto);
    return C_OK;
}

/* Parse a reply pointed to by parser->curr_location. */
int parseReply(ReplyParser *parser, void *p_ctx) {
    switch (parser->curr_location[0]) {
        case '$': return parseBulk(parser, p_ctx);
        case '+': return parseSimpleString(parser, p_ctx);
        case '-': return parseError(parser, p_ctx);
        case ':': return parseLong(parser, p_ctx);
        case '*': return parseArray(parser, p_ctx);
        case '~': return parseSet(parser, p_ctx);
        case '%': return parseMap(parser, p_ctx);
        case '#': return parseBool(parser, p_ctx);
        case ',': return parseDouble(parser, p_ctx);
        case '_': return parseNull(parser, p_ctx);
        case '(': return parseBigNumber(parser, p_ctx);
        case '=': return parseVerbatimString(parser, p_ctx);
        case '|': return parseAttributes(parser, p_ctx);
        default: if (parser->callbacks.error) parser->callbacks.error(p_ctx);
    }
    return C_ERR;
}
