﻿/*jslint indent: 2, maxlen: 80, continue: false, unparam: false */
/* -*- tab-width: 2 -*- */
/*global define: true, module: true, require: true */
((typeof define === 'function') && define.amd ? define : function (factory) {
  'use strict';
  var m = ((typeof module === 'object') && module), e = (m && m.exports);
  if (e) { m.exports = (factory(require, e, m) || m.exports); }
})(function () {
  'use strict';

  //function isNum(x) { return (x === +x); }
  function isDef(x) { return (x !== undefined); }
  function isStr(x) { return (typeof x === 'string'); }
  //function ifDef(x, d) { return (x === undefined ? d : x); }
  function ifFun(x, d) { return (typeof x === 'function' ? x : d); }
  function ifObj(x, d) { return ((x && typeof x) === 'object' ? x : d); }
  //function withThis(f) { return function () { return f(this); }; }
  function errExpectType(msg) { throw new TypeError('Expected ' + msg); }
  function ifSupported(f) { try { return f(); } catch (ignore) {} }
  function nope() { return false; }
  function sumLengths(sum, item) { return sum + item.length; }

  var mR, optSeq = 0, optTimes = 1, optLen = 2, optAddFunc = 3,
    lcopy = { call: function (src, maxN) { return src.slice(0, maxN); } },
    arSlice = Array.prototype.slice,
    tokenIsSequence = { token: 'This is a sequence' },
    isBuffer = (ifSupported(function () { return Buffer.isBuffer; }) || nope);


  function coreRepeat(cfg, seq, wantLen) {
    if (wantLen < 0) { wantLen = 0; }
    var add = (cfg[optAddFunc] || lcopy), prevRemain = wantLen,
      remain = wantLen - seq.length;
    //console.log({ rmn: remain, want: wantLen, seq: seq, add: add });
    if (remain <= 0) { return add.call(seq, wantLen); }
    while ((remain >= 1) && (remain < prevRemain)) {
      // stop when: ^-- done   or   ^-- futile
      // NB: use comparisons that will stop in case of NaN.
      seq = seq.concat(add.call(seq, remain));
      prevRemain = remain;
      remain = wantLen - seq.length;
    }
    if ((seq.isSeq === tokenIsSequence) && seq.unwrap) { seq = seq.unwrap(); }
    return seq;
  }

  function checkEssential(cfg) {
    // Does this config have what it takes to repeat values?
    var seq = cfg[optSeq], len;
    if (isDef(seq)) {
      len = cfg[optLen];
      if (isDef(len)) { return coreRepeat(cfg, seq, len); }
      len = cfg[optTimes];
      if (isDef(len)) { return coreRepeat(cfg, seq, len * seq.length); }
    }
    // Looks like nope, so for now all we can do is make an updated repeater:
    return mR(cfg);
  }

  function bufSeqSlice(offset, remain) {
    if (offset !== 0) { throw new Error('Offset not supported'); }
    var srcBufs = this.bufs, sbCnt, sbIdx, srcBuf, sbLen, slBufs;
    //console.log({ srcBufs: srcBufs, rmn: remain });
    if (this.length <= remain) { return srcBufs; }
    sbCnt = srcBufs.length;
    slBufs = [];
    slBufs.totalBytes = 0;
    for (sbIdx = 0; (remain > 0) && (sbIdx < sbCnt); sbIdx += 1) {
      srcBuf = srcBufs[sbIdx];
      sbLen = srcBuf.length;
      if (sbLen > remain) {
        slBufs.push(srcBuf.slice(0, remain));
        slBufs.totalBytes += remain;
        remain = 0;
      } else {
        slBufs.push(srcBuf);
        slBufs.totalBytes += sbLen;
        remain -= sbLen;
      }
    }
    //console.log({ slBufs: slBufs });
    return slBufs;
  }

  function bufSeqConcatInplace(moreBufs) {
    var tb = moreBufs.totalBytes;
    if (tb !== +tb) { tb = moreBufs.reduce(sumLengths, 0); }
    this.bufs = this.bufs.concat(moreBufs);
    //console.log({ bufs: this.bufs });
    this.length += tb;
    this.bufs.totalBytes = this.length;
    return this;
  }

  function bufSeqUnwrap() {
    return Buffer.concat(this.bufs, this.totalBytes);
  }

  function makeBufSeq(b) {
    var l = [ b ], n = b.length, s = { bufs: l, length: n,
      slice:  bufSeqSlice,
      concat: bufSeqConcatInplace,
      unwrap: bufSeqUnwrap,
      isSeq: tokenIsSequence };
    l.totalBytes = n;
    //console.log({ makeBufSeq: s });
    return s;
  }

  function toSeq(x) {
    if (isStr(x)) { return x; }
    if (ifObj(x)) {
      if (x.isSeq === tokenIsSequence) { return x; }
      if (isBuffer(x)) { return makeBufSeq(x); }
      return arSlice.call(x);
    }
    return;
  }

  function concatArgs(a) {
    if (a.length === 0) { return ''; }  // fallback should be false-y
    var x = toSeq(a[0]);
    if (x === undefined) { return a; }
    if (a.length < 2) { return x; }
    return x.concat.apply(x, arSlice.call(a, 1));
  }

  function makeOptSetter(validate, origCfg, slot) {
    return function (x) {
      var cfg = origCfg.slice();
      cfg[slot] = validate(x);
      return checkEssential(cfg);
    };
  }

  //function mightBeSeq(x, d) {
  //  if (x === '') { return x; }
  //  if (x && isNum(x.length)) { return x; }
  //  return (d || false);
  //}

  //function guessSeq(s) { return (s.length === 1 ? mightBeSeq(s[0], s) : s); }

  function validateSeq(x) {
    x = toSeq(x);
    if (x !== undefined) { return x; }
    errExpectType('sequence to be a string or an object');
  }

  function validateCallable(x) {
    if (x && ifFun(x.call)) { return x; }
    errExpectType('a function');
  }

  function validateNum(x) {
    x = +x;
    if (x === 0) { return x; }
    if (x > 0) { return x; }
    // No need to test integer safety because we'll add stuff only as long
    // as distance to target quantity shrinks.
    errExpectType('a positive number, or zero.');
  }

  mR = function makeRepeater(cfg) {
    var r = function () { return r.seq(concatArgs(arguments)); };
    //#arar
    r.arar  = function () { return r.seq(arguments); };
    //#
    r.seq   = makeOptSetter(validateSeq, cfg, optSeq);
    r.str   = makeOptSetter(String, cfg, optSeq);

    r.mthd  = makeOptSetter(validateCallable, cfg, optAddFunc);
    r.func  = function (g) { return r.mthd({ call: g }); };

    r.len   = makeOptSetter(validateNum, cfg, optLen);
    r.times = makeOptSetter(validateNum, cfg, optTimes);
    r.n     = r.times;

    return r;
  };












  return mR([]);
});
