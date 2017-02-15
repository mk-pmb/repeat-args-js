/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


function compose(g) {
  return function (f) {
    return function () { return g(f.apply(this, arguments)); };
  };
}

