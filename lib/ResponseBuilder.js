"use strict";
const Constants = require('./Constants');

class ResponseBuilder {
	constructor(fileUtils, networkingUtils) {
		this._fileUtils = fileUtils;
		this._networkingUtils = networkingUtils;
	}
	createResponseHeaders(requestHeaders, file, contentLength) {
		//todo: validate parameters
        let contentType = this._fileUtils.getMimeType(file);
        let connection = requestHeaders['connection'] ? Constants.connectionKeepAlive : Constants.connectionClose;
        let httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;

        let headers = [
            `${Constants.httpVersion} ${httpStatus.code} ${httpStatus.reason}`,
            `Server: ${Constants.serverName }`,
            `Content-Type: ${contentType}`,
            `Connection: ${connection}`,
            `Content-Length: ${contentLength}`
        ];

        return headers.join(Constants.headerLineDelimiter);
    }
    createResponse(body, headers) {
        if (body && !this._networkingUtils.isArrayBuffer(body)) throw new Error("Body must be a byte array or null.");
        if (typeof headers !== "string") throw new Error("Headers must be a string");

        let headersByteArray = this._networkingUtils.toByteArray(headers + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
        if (!body) return headersByteArray.buffer;

		return this._networkingUtils.merge(headersByteArray, body);
    }
}

module.exports = ResponseBuilder;