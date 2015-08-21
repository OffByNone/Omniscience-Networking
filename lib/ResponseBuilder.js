"use strict";
const Constants = require('./Constants');

class ResponseBuilder {
	constructor(networkingUtils) {
		this._networkingUtils = networkingUtils;
	}
	createResponseHeaders(requestHeaders, mimetype, contentLength, eTag) {
		//todo: validate parameters
        let contentType = mimetype;
        let connection = requestHeaders['connection'] ? Constants.connectionKeepAlive : Constants.connectionClose;
        let httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;
		let date = new Date().toUTCString();

        let headers = [
            `${Constants.httpVersion} ${httpStatus.code} ${httpStatus.reason}`,
            `Server: ${Constants.serverName }`,
            `Content-Type: ${contentType}`,
            `Connection: ${connection}`,
            `Content-Length: ${contentLength}`,
			`ETag: ${eTag}`,
			`Date: ${date}`,
			`Accept-Ranges: bytes`,
			`Cache-Control: no-cache`
        ];

		if (requestHeaders['range']) {
			let range = this._networkingUtils.parseRange(requestHeaders['range']);
			headers.push(`Content-Range: bytes ${range}-${contentLength}/${contentLength}`);
		}

		return this._networkingUtils.toByteArray(headers.join(Constants.headerLineDelimiter) + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
    }
}

module.exports = ResponseBuilder;