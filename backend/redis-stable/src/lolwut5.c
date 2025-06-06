/*
 * Copyright (c) 2018-Present, Redis Ltd.
 * All rights reserved.
 *
 * Licensed under your choice of (a) the Redis Source Available License 2.0
 * (RSALv2); or (b) the Server Side Public License v1 (SSPLv1); or (c) the
 * GNU Affero General Public License v3 (AGPLv3).
 *
 * ----------------------------------------------------------------------------
 *
 * This file implements the LOLWUT command. The command should do something
 * fun and interesting, and should be replaced by a new implementation at
 * each new version of Redis.
 */

#include "server.h"
#include "lolwut.h"
#include <math.h>

/* Translate a group of 8 pixels (2x4 vertical rectangle) to the corresponding
 * braille character. The byte should correspond to the pixels arranged as
 * follows, where 0 is the least significant bit, and 7 the most significant
 * bit:
 *
 *   0 3
 *   1 4
 *   2 5
 *   6 7
 *
 * The corresponding utf8 encoded character is set into the three bytes
 * pointed by 'output'.
 */
#include <stdio.h>
void lwTranslatePixelsGroup(int byte, char *output) {
    int code = 0x2800 + byte;
    /* Convert to unicode. This is in the U0800-UFFFF range, so we need to
     * emit it like this in three bytes:
     * 1110xxxx 10xxxxxx 10xxxxxx. */
    output[0] = 0xE0 | (code >> 12);          /* 1110-xxxx */
    output[1] = 0x80 | ((code >> 6) & 0x3F);  /* 10-xxxxxx */
    output[2] = 0x80 | (code & 0x3F);         /* 10-xxxxxx */
}

/* Schotter, the output of LOLWUT of Redis 5, is a computer graphic art piece
 * generated by Georg Nees in the 60s. It explores the relationship between
 * caos and order.
 *
 * The function creates the canvas itself, depending on the columns available
 * in the output display and the number of squares per row and per column
 * requested by the caller. */
lwCanvas *lwDrawSchotter(int console_cols, int squares_per_row, int squares_per_col) {
    /* Calculate the canvas size. */
    int canvas_width = console_cols*2;
    int padding = canvas_width > 4 ? 2 : 0;
    float square_side = (float)(canvas_width-padding*2) / squares_per_row;
    int canvas_height = square_side * squares_per_col + padding*2;
    lwCanvas *canvas = lwCreateCanvas(canvas_width, canvas_height, 0);

    for (int y = 0; y < squares_per_col; y++) {
        for (int x = 0; x < squares_per_row; x++) {
            int sx = x * square_side + square_side/2 + padding;
            int sy = y * square_side + square_side/2 + padding;
            /* Rotate and translate randomly as we go down to lower
             * rows. */
            float angle = 0;
            if (y > 1) {
                float r1 = (float)rand() / (float) RAND_MAX / squares_per_col * y;
                float r2 = (float)rand() / (float) RAND_MAX / squares_per_col * y;
                float r3 = (float)rand() / (float) RAND_MAX / squares_per_col * y;
                if (rand() % 2) r1 = -r1;
                if (rand() % 2) r2 = -r2;
                if (rand() % 2) r3 = -r3;
                angle = r1;
                sx += r2*square_side/3;
                sy += r3*square_side/3;
            }
            lwDrawSquare(canvas,sx,sy,square_side,angle,1);
        }
    }

    return canvas;
}

/* Converts the canvas to an SDS string representing the UTF8 characters to
 * print to the terminal in order to obtain a graphical representation of the
 * logical canvas. The actual returned string will require a terminal that is
 * width/2 large and height/4 tall in order to hold the whole image without
 * overflowing or scrolling, since each Barille character is 2x4. */
static sds renderCanvas(lwCanvas *canvas) {
    sds text = sdsempty();
    for (int y = 0; y < canvas->height; y += 4) {
        for (int x = 0; x < canvas->width; x += 2) {
            /* We need to emit groups of 8 bits according to a specific
             * arrangement. See lwTranslatePixelsGroup() for more info. */
            int byte = 0;
            if (lwGetPixel(canvas,x,y)) byte |= (1<<0);
            if (lwGetPixel(canvas,x,y+1)) byte |= (1<<1);
            if (lwGetPixel(canvas,x,y+2)) byte |= (1<<2);
            if (lwGetPixel(canvas,x+1,y)) byte |= (1<<3);
            if (lwGetPixel(canvas,x+1,y+1)) byte |= (1<<4);
            if (lwGetPixel(canvas,x+1,y+2)) byte |= (1<<5);
            if (lwGetPixel(canvas,x,y+3)) byte |= (1<<6);
            if (lwGetPixel(canvas,x+1,y+3)) byte |= (1<<7);
            char unicode[3];
            lwTranslatePixelsGroup(byte,unicode);
            text = sdscatlen(text,unicode,3);
        }
        if (y != canvas->height-1) text = sdscatlen(text,"\n",1);
    }
    return text;
}

/* The LOLWUT command:
 *
 * LOLWUT [terminal columns] [squares-per-row] [squares-per-col]
 *
 * By default the command uses 66 columns, 8 squares per row, 12 squares
 * per column.
 */
void lolwut5Command(client *c) {
    long cols = 66;
    long squares_per_row = 8;
    long squares_per_col = 12;

    /* Parse the optional arguments if any. */
    if (c->argc > 1 &&
        getLongFromObjectOrReply(c,c->argv[1],&cols,NULL) != C_OK)
        return;

    if (c->argc > 2 &&
        getLongFromObjectOrReply(c,c->argv[2],&squares_per_row,NULL) != C_OK)
        return;

    if (c->argc > 3 &&
        getLongFromObjectOrReply(c,c->argv[3],&squares_per_col,NULL) != C_OK)
        return;

    /* Limits. We want LOLWUT to be always reasonably fast and cheap to execute
     * so we have maximum number of columns, rows, and output resolution. */
    if (cols < 1) cols = 1;
    if (cols > 1000) cols = 1000;
    if (squares_per_row < 1) squares_per_row = 1;
    if (squares_per_row > 200) squares_per_row = 200;
    if (squares_per_col < 1) squares_per_col = 1;
    if (squares_per_col > 200) squares_per_col = 200;

    /* Generate some computer art and reply. */
    lwCanvas *canvas = lwDrawSchotter(cols,squares_per_row,squares_per_col);
    sds rendered = renderCanvas(canvas);
    rendered = sdscat(rendered,
        "\nGeorg Nees - schotter, plotter on paper, 1968. Redis ver. ");
    rendered = sdscat(rendered,REDIS_VERSION);
    rendered = sdscatlen(rendered,"\n",1);
    addReplyVerbatim(c,rendered,sdslen(rendered),"txt");
    sdsfree(rendered);
    lwFreeCanvas(canvas);
}
