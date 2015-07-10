"use strict";

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

module.exports = {
    toByteArray: function toByteArray(strToConvert) {
        return new Uint8Array([].map.call(strToConvert || "", function (i) {
            return i.charCodeAt(0);
        }));
    },
    toBuffer: function toBuffer(stringOrByteArray) {
        if (typeof stringOrByteArray === "string") return this.toByteArray(stringOrByteArray).buffer;
        if (stringOrByteArray instanceof Uint8Array) return stringOrByteArray.buffer;else throw new Error("argument must be of type string or Uint8Array");
    },
    toString: function toString(arrayBuffer) {
        var results = [];
        var uint8Array = new Uint8Array(arrayBuffer);

        for (var i = 0, length = uint8Array.length; i < length; i += 200000) //todo: figure out what this 200000 means, then move to constants
        results.push(String.fromCharCode.apply(String, _toConsumableArray(uint8Array.subarray(i, i + 200000))));

        return results.join("");
    },
    merge: function merge() {
        for (var _len = arguments.length, arrayBuffers = Array(_len), _key = 0; _key < _len; _key++) {
            arrayBuffers[_key] = arguments[_key];
        }

        return arrayBuffers.reduce(function (previous, current) {
            var smushed = new Uint8Array(previous.byteLength + current.byteLength);
            smushed.set(new Uint8Array(previous), 0);
            smushed.set(new Uint8Array(current), previous.byteLength);
            return smushed.buffer;
        });
    },
    parseRange: function parseRange(rangeHeader) {
        if (!rangeHeader) return 0;

        var _rangeHeader$split = rangeHeader.split("=");

        var _rangeHeader$split2 = _slicedToArray(_rangeHeader$split, 2);

        var type = _rangeHeader$split2[0];
        var offsetPlusDash = _rangeHeader$split2[1];

        if (type.toLowerCase() !== "bytes") return 0;

        return Number(offsetPlusDash.replace("-", ""));
    },
    offsetBytes: function offsetBytes(offset, fileBytes) {
        if (!offset || offset <= 0) return fileBytes;
        return fileBytes.subarray(offset);
    },

    /* untestable */
    isArrayBuffer: function isArrayBuffer(obj) {
        //this is here because running jasmine cli (node) will cause it to blow up.
        return ArrayBuffer.isView(obj);
    }
};