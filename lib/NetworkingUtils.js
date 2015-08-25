"use strict";
module.exports = {
    toByteArray: function (strToConvert) {
        return new Uint8Array([].map.call(strToConvert || '', i => i.charCodeAt(0)));
    },
    toBuffer: function (stringOrByteArray) {
		if (typeof stringOrByteArray === "string")
			return this.toByteArray(stringOrByteArray).buffer;
		if (stringOrByteArray instanceof Uint8Array)
			return stringOrByteArray.buffer;
		else
			throw new Error("argument must be of type string or Uint8Array");
    },
	toString: function(arrayBuffer) {
        let uint8Array = new Uint8Array(arrayBuffer);

		return String.fromCharCode(...uint8Array);
		//the above could error if too many arguments are passed into fromCharCode
		//I dont think this is likely to happen, so I removed the loop that was here
		//for more information see http://stackoverflow.com/questions/22747068/is-there-a-max-number-of-arguments-javascript-functions-can-accept
    },
    merge: function (...arrayBuffers) {
        return arrayBuffers.reduce((previous, current) => {
            let smushed = new Uint8Array(previous.byteLength + current.byteLength);
            smushed.set(new Uint8Array(previous), 0);
            smushed.set(new Uint8Array(current), previous.byteLength);
            return smushed.buffer;
        });
    },
    parseRange: function (rangeHeader) {
		if (!rangeHeader) return [0, null];
		let [rangeType, startEnd] = rangeHeader.split('=');
		if (rangeType.toLowerCase() !== "bytes") return [0, null];
		return startEnd.split('-'); //returns [start,end]
    },

	/* untestable */
	isArrayBuffer: function (obj) {
		//this is here because running jasmine cli (node) will cause it to blow up.
		return ArrayBuffer.isView(obj);
	}
};