const Constants = require('./Constants');

class FileResponder {
    constructor(fileUtils, httpResponder, networkingUtils, socketSender) {
        this._httpResponder = httpResponder;
        this._fileUtils = fileUtils;
        this._networkingUtils = networkingUtils;
        this._socketSender = socketSender;
    }

    sendResponse(request, filePath) {
		//todo: look into why I am taking a file path, turning it into a file then back into a file path
		//iirc it is because sometimes I get a path, sometimes i get a file.  But I am not sure this is still the case
		//even if it is, there is likely a better way to handle it. 
        try {
            var file = this._fileUtils.create(filePath);
            this._fileUtils.readBytes(file.path).then(fileBytes => {
            	var keepAlive = false;
                var offset = this._networkingUtils.parseRange(request.headers['range']);
                fileBytes = this._networkingUtils.offsetBytes(offset, fileBytes);

                var responseHeaders = this.createResponseHeaders(request.headers, file, fileBytes.byteLength);
                if (request.method.toLowerCase() === 'head') fileBytes = null;
                if (request.headers['connection'] === 'keep-alive') keepAlive = true;

                var response = this.createResponse(fileBytes, responseHeaders);

                this._socketSender.send(request.socket, response, keepAlive);
            });
        }
        catch (e) {
            console.log(e);
            this._httpResponder.sendErrorResponse(request.socket);
        }
    }
    createResponseHeaders(requestHeaders, file, contentLength) {
        var contentType = this._fileUtils.getMimeType(file);
        var connection = requestHeaders['connection'] ? 'keep-alive' : 'close';
        var httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;

        var headers = [
            `${Constants.httpVersion} ${httpStatus.code} ${httpStatus.reason}`,
            `Server: ${Constants.serverName }`,
            `Content-Type: ${contentType}`,
            `Connection: ${connection}`,
            `Content-Length: ${contentLength}`
        ];

        return headers.join(Constants.headerLineDelimiter);
    }
    createResponse(body, headers) {
        if (body && !ArrayBuffer.isView(body)) throw new Error("Body must be a byte array or null.");
        if (typeof headers !== "string") throw new Error("Headers must be a string");

        var headersByteArray = this._networkingUtils.toByteArray(headers + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
        if(!body) return headersByteArray.buffer;

		return this._networkingUtils.merge(headersByteArray, body);
    }
}

module.exports = FileResponder;