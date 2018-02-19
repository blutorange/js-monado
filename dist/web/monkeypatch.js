"use strict";

require("core-js/modules/es6.map");

require("core-js/modules/es6.set");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Methods_1 = require("./Methods");

var StreamFactory_1 = require("./StreamFactory");

function patch(type, getStream, wrapStream) {
  var name = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "stream";

  if (Object.hasOwnProperty.call(type.prototype, name)) {
    return;
  }

  Object.defineProperty(type.prototype, name, {
    configurable: false,
    enumerable: false,
    value: function value() {
      return wrapStream(getStream(this));
    },
    writable: false
  });
}

function monkeyPatch() {
  var inplace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var stream = inplace ? StreamFactory_1.InplaceStreamFactory.stream : StreamFactory_1.TypesafeStreamFactory.stream;
  patch(Array, function (array) {
    return array;
  }, stream);
  patch(Set, function (set) {
    return set.values();
  }, stream);
  patch(Map, function (map) {
    return map.entries();
  }, stream);
  patch(Object, function (object) {
    return Methods_1.fromObject(object);
  }, stream);
  patch(Object, function (object) {
    return Methods_1.fromObjectKeys(object);
  }, stream, "keys");
  patch(Object, function (object) {
    return Methods_1.fromObjectValues(object);
  }, stream, "values");
  patch(String, function (s) {
    return s;
  }, stream);
}

exports.monkeyPatch = monkeyPatch;