"use strict";
const Constants = require('./Constants');

class ResponseBuilder {
	constructor(networkingUtils) {
		this._networkingUtils = networkingUtils;
	}
	createResponseHeaders(requestHeaders, mimetype, contentLength, eTag) {
		if (typeof requestHeaders !== "object") throw new Error("Argument 'requestHeaders' is tyepof '" + typeof requestHeaders  + "' but needs to be 'object'");
		if (typeof mimetype !== "string") throw new Error("Argument 'mimetype' is tyepof '" + typeof mimetype  + "' but needs to be 'string'");
		if (typeof contentLength === "undefined" || contentLength === null) throw new Error("Argument 'contentLength' cannot be null");

        let contentType = mimetype;
        let connection = requestHeaders['connection'] ? Constants.connectionKeepAlive : Constants.connectionClose;
        let httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;
		let date = new Date().toUTCString();

		let [start, end] = this._networkingUtils.parseRange(requestHeaders['range']);
		end = end || contentLength;
		let actualLength = Number(end) - Number(start);

        let headers = [
            `${Constants.httpVersion} ${httpStatus.code} ${httpStatus.reason}`,
            `Server: ${Constants.serverName }`,
            `Content-Type: ${contentType}`,
            `Connection: ${connection}`,
            `Content-Length: ${actualLength}`,
			`Date: ${date}`,
			`Accept-Ranges: bytes`,
			`Cache-Control: no-cache`
        ];

		if (typeof eTag !== "undefined" && eTag === null)
			headers.push(`ETag: ${eTag}`);

		if (typeof requestHeaders['range'] !== "undefined" && requestHeaders['range'] === null)
			headers.push(`Content-Range: bytes ${start}-${end}/${contentLength}`);

		return this._networkingUtils.toByteArray(headers.join(Constants.headerLineDelimiter) + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
    }
}

module.exports = ResponseBuilder;