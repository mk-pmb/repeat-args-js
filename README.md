
<!--#echo json="package.json" key="name" underline="=" -->
repeat-args
===========
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Yet another take at repeating sequences (string, array, array-like, buffer),
also in browsers (UMD).
<!--/#echo -->


API
---

It's all about _repeaters_.
* They're functions that can remember and take parameters.
* The _essential_ parameters are a _source_ sequence
  and a target quantity _length_.
* Repeaters can't learn, they can only evolve:
  When you give a parameter to a repeater,
  it will always produce something new,
  based on the new parameter and the ones it remembers.
  * When you provide the last missing essential parameter, by default
    you get a sequence with _length_ items from _source_, repeated in
    original order if necessary.
    You can modify this default behavior by configuring
    the _addFunc_ parameter – see below.
  * When an essential parameter remains unknown, you get
    a new repeater that remembers your new parameter and
    all the ones that its producer knew.

This module exports a repeater that knows none of the
essential parameters, so you have something to start with:

<!--#include file="test/usage.js" start="  //#require" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="3" -->
```javascript
var r = require('repeat-args'), x = '.o°';
```
<!--/include-->

All repeaters have this interface:


### r(…stuff)

With less than one argument, use an empty string as the _source_ parameter.
(Chosen because it is a sequence of length 0, and also a false-y value.)

<!--#include file="test/usage.js" start="  //#r-no-args" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="6" -->
```javascript
equal(r().times(2),     '');
equal(r().times(0),     '');
equal(r().len(2),       '');
equal(r().len(0),       '');
```
<!--/include-->

With at least one argument, of which the first one is recognized as a sequece:
Merge all arguments into a sequence of the same type as the first argument,
and use that combined sequence as the _source_ parameter.

<!--#include file="test/usage.js" start="  //#r-times3-brackets" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="5" -->
```javascript
equal(r.times(3)(x),           '.o°.o°.o°');
equal(r.times(3)([x]),        ['.o°', '.o°', '.o°']);
equal(r.times(3)([ [x] ]),  [ ['.o°'], ['.o°'], ['.o°'] ]);
```
<!--/include-->

<!--#include file="test/usage.js" start="  //#r-hi57" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="8" -->
```javascript
equal(r('h', 'i', 5, 7).times(0),   '');
equal(r('h', 'i', 5, 7).times(2),   'hi57hi57');
equal(r(['h', 'i', 5, 7]).times(2),
        ['h', 'i', 5, 7, 'h', 'i', 5, 7]);
equal(r([ ['h', 'i', 5, 7] ]).times(2),
        [ ['h', 'i', 5, 7], ['h', 'i', 5, 7] ]);
```
<!--/include-->

If none of the above was applicable, behave as `r.arar(…stuff)` would.

<!--#include file="test/usage.js" start="  //#r-69ab" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="9" -->
```javascript
equal(r(6, 9, 'a', 'b').times(2),
      [ 6, 9, 'a', 'b', 6, 9, 'a', 'b' ]);
// same as:
equal(r([], 6, 9, 'a', 'b').times(2),
          [ 6, 9, 'a', 'b', 6, 9, 'a', 'b' ]);
// to force a string instead:
equal(r('', 6, 9, 'a', 'b').times(2),   '69ab69ab');
```
<!--/include-->


### r.len(q)

Use `q` as the _length_ parameter.


### r.times(n), r.n(n)

Use "`n` times the length of _source_" as the _length_ parameter.
The formula will be calculated as soon as the _source_ parameter is known,
which might be immediately.


### r.arar(…stuff)

Put all (0 or more) arguments into an array (arar = "ARguments ARray")
and use that as the _source_ parameter.

<!--#include file="test/usage.js" start="  //#r-arar" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="5" -->
```javascript
equal(r.times(2).arar(),          []);
equal(r.times(2).arar(42),        [42, 42]);
equal(r.times(2).arar(3.14, 15),  [3.14, 15, 3.14, 15]);
```
<!--/include-->


### r.seq(string | buffer | array | list)

Use the first argument as the _source_ parameter.
The _list_ means anything that `Array.prototype.slice` can make an array from.

<!--#include file="test/usage.js" start="  //#buffer" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="9" -->
```javascript
x = ifSupported(function () { return Buffer.from('.o°'); });
if (x) {
  equal(x.length, 4);     // in UTF-8, '°' costs 2 bytes.
  equal(r.times(3)(x),    Buffer.from('.o°.o°.o°'));
  equal(12,               Buffer.from('.o°.o°.o°').length);
  equal(r.len(9)(x),      Buffer.from('.o°.o°.'));  // 7 chars in 9 bytes
}
```
<!--/include-->


### r.str(x)

Shorthand for `r.seq(String(x))`.

<!--#include file="test/usage.js" start="  //#r-str" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="5" -->
```javascript
equal(r.times(3).str(),           'undefinedundefinedundefined');
equal(r.times(3).str(42),         '424242');
equal(r.times(3).str(3.14, 15),   '3.143.143.14');
```
<!--/include-->


### r.func(add)

Use `add` as the _addFunc_ parameter. The _addFunc_ should be a function.
It will be invoked with two arguments `accum` and `maxN`.
The `accum` (accumulator) is a sequence in which elements are collected.
When it is long enough, that will be the repeater's result.

The `maxN` argument is a number that tells _addFunc_ up to how many new
elements it shall produce in this invocation.
The _addFunc_ may safely ignore `maxN` in cases where it produces at most
one element.
(It's the repeater's job to make sure to either not request less than one
element, or to discard the excess ones.)

If _addFunc_ has produced exaclty one element and it is of another type
than the accumulator, that element may be returned as-is.
In all other cases (same type, multiple elements, no elements),
the _addFunc_ should return a sequence of the same type as the accumulator.

Returning an empty sequence indicates that no more values can be produced,
even in future attempts. The repeater then enters _futile mode_.
The _addFunc_ must not make any assumptions about how often the repeater in
futile mode will invoke it to request more elements. (At time of writing,
it stops immediately.)
A repeater may optionally leave futile mode if any new elements are produced.
(Not really relevant since the _addFunc_ won't know about that.)

<!--#include file="test/usage.js" start="  //#fiboArg" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="11" -->
```javascript
function fiboArg(accum) {
  var n = accum.length;
  return (accum[n - 1] + accum[n - 2]);
}
equal(r.func(fiboArg).times(4)(1, 1),     [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
equal(r.func(fiboArg).len(8)(1, 1),       [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
equal(r.func(fiboArg).len(8)('AB', 'rs'), 'ABrssrrs');
equal(r.func(fiboArg).len(6)(['AB', 'rs']),
  [ 'AB', 'rs', 'rsAB', 'rsABrs', 'rsABrsrsAB', 'rsABrsrsABrsABrs' ]);
```
<!--/include-->


### r.mthd(add)

Like `r.func` but the _addFunc_ is invoked with just the `maxN` argument,
and its invocation context (`this`) will be set to the accumulator.

<!--#include file="test/usage.js" start="  //#fiboMtd" stop="  //#"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="11" -->
```javascript
function fiboMtd() {  // no named arguments since we ignore maxN
  var accum = this, n = accum.length;
  return (accum[n - 1] + accum[n - 2]);
}
equal(r.mthd(fiboMtd).times(4)(1, 1),     [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
equal(r.mthd(fiboMtd).len(8)(1, 1),       [ 1, 1, 2, 3, 5, 8, 13, 21 ]);
equal(r.mthd(fiboMtd).len(8)('AB', 'rs'), 'ABrssrrs');
equal(r.mthd(fiboMtd).len(6)(['AB', 'rs']),
  [ 'AB', 'rs', 'rsAB', 'rsABrs', 'rsABrsrsAB', 'rsABrsrsABrsABrs' ]);
```
<!--/include-->











<!--#toc stop="scan" -->



Known issues
------------

* It can't work async. Try the `times` function from the `async` module.
  or promises.
* Needs more/better tests and docs.




License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
