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
    toString: function (arrayBuffer) {
        let results = [];
        let uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0, length = uint8Array.length; i < length; i += 200000) //todo: figure out what this 200000 means, then move to constants
            results.push(String.fromCharCode(...uint8Array.subarray(i, i + 200000)));

        return results.join('');
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
		if (!rangeHeader) return 0;
		let [type, offsetPlusDash] = rangeHeader.split('=');
		if (type.toLowerCase() !== "bytes") return 0;

		return Number(offsetPlusDash.replace('-', ''));
    },
    offsetBytes: function (offset, fileBytes) {
		if (!offset || offset <= 0) return fileBytes;
		return fileBytes.subarray(offset);
    },

	/* untestable */
	isArrayBuffer: function (obj) {
		//this is here because running jasmine cli (node) will cause it to blow up.
		return ArrayBuffer.isView(obj);
	}
};