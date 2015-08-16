"use strict";

class FileResponder {
    constructor(fileUtils, httpResponder, networkingUtils, socketSender, responseBuilder) {
        this._httpResponder = httpResponder;
        this._fileUtils = fileUtils;
        this._networkingUtils = networkingUtils;
        this._socketSender = socketSender;
		this._responseBuilder = responseBuilder;
    }

    sendResponse(request, filePath) {
		this._fileUtils.readBytes(filePath).then(({fileBytes, mimetype}) => {
			let keepAlive = false;
			let offset = this._networkingUtils.parseRange(request.headers['range']);
			let fileResponseBytes = this._networkingUtils.offsetBytes(offset, fileBytes);

			let responseHeaders = this._responseBuilder.createResponseHeaders(request.headers, mimetype, fileResponseBytes.byteLength);
			if (request.method.toLowerCase() === 'head') fileResponseBytes = null;
			if (request.headers['connection'] === 'keep-alive') keepAlive = true;

			this._socketSender.send(request.socket, responseHeaders.buffer, true)
				.then(() => {
					console.log("headers sent, sending body.");
					this._socketSender.send(request.socket, fileResponseBytes.buffer, keepAlive);
				});
		},
			(err) => {
				console.warn(err);
				this._httpResponder.sendErrorResponse(request.socket);
			});
    }
}

module.exports = FileResponder;