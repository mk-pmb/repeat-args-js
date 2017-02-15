﻿/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var equal = require('assert').deepStrictEqual;

(function readmeDemo() {
  //#require
  var r = require('repeat-args'), x = '.o°';
  //#
  function catchStr(f) { try { f(); } catch (err) { return String(err); } }
  function fails(f, e) { equal(catchStr(f), e); }

  //#r-times3-brackets
  equal(r.times(3)(x),           '.o°.o°.o°');
  equal(r.times(3)([x]),        ['.o°', '.o°', '.o°']);
  equal(r.times(3)([ [x] ]),  [ ['.o°'], ['.o°'], ['.o°'] ]);
  //#

  //#r-arar
  equal(r.times(2).arar(),          []);
  equal(r.times(2).arar(42),        [42, 42]);
  equal(r.times(2).arar(3.14, 15),  [3.14, 15, 3.14, 15]);
  //#

  //#r-str
  equal(r.times(3).str(),           'undefinedundefinedundefined');
  equal(r.times(3).str(42),         '424242');
  equal(r.times(3).str(3.14, 15),   '3.143.143.14');
  //#

  equal(r(x).times(4),  '.o°.o°.o°.o°');
  equal(r(x).len(7),    '.o°.o°.');
  equal(r(x).len(6),    '.o°.o°');
  equal(r(x).len(5),    '.o°.o');
  equal(r(x).len(4),    '.o°.');
  equal(r(x).len(3),    '.o°');
  equal(r(x).len(2),    '.o');
  equal(r(x).len(1),    '.');
  equal(r(x).len(0),    '');
  fails(function () { r.seq(x).len(-1); },
    'TypeError: Expected a positive number, or zero.');

  //#r-hi57
  equal(r('h', 'i', 5, 7).times(0),   '');
  equal(r('h', 'i', 5, 7).times(2),   'hi57hi57');
  equal(r(['h', 'i', 5, 7]).times(2),
          ['h', 'i', 5, 7, 'h', 'i', 5, 7]);
  equal(r([ ['h', 'i', 5, 7] ]).times(2),
          [ ['h', 'i', 5, 7], ['h', 'i', 5, 7] ]);
  //#

  //#r-69ab
  equal(r(6, 9, 'a', 'b').times(2),
        [ 6, 9, 'a', 'b', 6, 9, 'a', 'b' ]);
  // same as:
  equal(r([], 6, 9, 'a', 'b').times(2),
            [ 6, 9, 'a', 'b', 6, 9, 'a', 'b' ]);
  // to force a string instead:
  equal(r('', 6, 9, 'a', 'b').times(2),   '69ab69ab');
  //#

  equal(r('h', 'i', 5, 7).len(3),
          'hi5');
  equal(r(['h', 'i', 5, 7]).len(3),
          ['h', 'i', 5]);
  equal(r([ ['h', 'i', 5, 7] ]).len(3),
          [ ['h', 'i', 5, 7], ['h', 'i', 5, 7], ['h', 'i', 5, 7] ]);

  //#r-no-args
  equal(r().times(2),     '');
  equal(r().times(0),     '');
  equal(r().len(2),       '');
  equal(r().len(0),       '');
  //#

  equal(r([]).times(2),   []);
  equal(r([]).times(0),   []);


  //#fiboArg
  function fiboArg(accum) {
    var n = accum.length;
    return (accum[n - 1] + accum[n - 2]);
  }
  equal(r.func(fiboArg).times(4)(1, 1),     [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
  equal(r.func(fiboArg).len(8)(1, 1),       [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
  equal(r.func(fiboArg).len(8)('AB', 'rs'), 'ABrssrrs');
  equal(r.func(fiboArg).len(6)(['AB', 'rs']),
    [ 'AB', 'rs', 'rsAB', 'rsABrs', 'rsABrsrsAB', 'rsABrsrsABrsABrs' ]);
  //#

  //#fiboMtd
  function fiboMtd() {  // no named arguments since we ignore maxN
    var accum = this, n = accum.length;
    return (accum[n - 1] + accum[n - 2]);
  }
  equal(r.mthd(fiboMtd).times(4)(1, 1),     [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
  equal(r.mthd(fiboMtd).len(8)(1, 1),       [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
  equal(r.mthd(fiboMtd).len(8)('AB', 'rs'), 'ABrssrrs');
  equal(r.mthd(fiboMtd).len(6)(['AB', 'rs']),
    [ 'AB', 'rs', 'rsAB', 'rsABrs', 'rsABrsrsAB', 'rsABrsrsABrsABrs' ]);
  //#


}());









console.log("+OK usage test passed.");    //= "+OK usage test passed."
