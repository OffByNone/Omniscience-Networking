"use strict";
const Constants = require('./Constants');

class ResponseBuilder {
	constructor(networkingUtils) {
		this._networkingUtils = networkingUtils;
	}
	createResponseHeaders(requestHeaders, mimetype, contentLength) {
		//todo: validate parameters
        let contentType = mimetype;
        let connection = requestHeaders['connection'] ? Constants.connectionKeepAlive : Constants.connectionClose;
        let httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;

        let headers = [
            `${Constants.httpVersion} ${httpStatus.code} ${httpStatus.reason}`,
            `Server: ${Constants.serverName }`,
            `Content-Type: ${contentType}`,
            `Connection: ${connection}`,
            `Content-Length: ${contentLength}`,
			`Accept-Ranges: bytes`,
			/*`Transfer-Encoding: chunked`*/
        ];

		return this._networkingUtils.toByteArray(headers.join(Constants.headerLineDelimiter) + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
    }
}

module.exports = ResponseBuilder;