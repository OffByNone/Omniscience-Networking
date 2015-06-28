const Constants = require('./Constants');

class FileResponder {
    constructor(fileUtils, httpResponder, networkingUtils, socketSender, responseBuilder) {
        this._httpResponder = httpResponder;
        this._fileUtils = fileUtils;
        this._networkingUtils = networkingUtils;
        this._socketSender = socketSender;
		this._responseBuilder = responseBuilder;
    }

    sendResponse(request, filePath) {
        try {
            var file = this._fileUtils.create(filePath);
            this._fileUtils.readBytes(file.path).then(fileBytes => {
				var keepAlive = false;
                var offset = this._networkingUtils.parseRange(request.headers['range']);
                var fileResponseBytes = this._networkingUtils.offsetBytes(offset, fileBytes);

                var responseHeaders = this._responseBuilder.createResponseHeaders(request.headers, file, fileResponseBytes.byteLength);
                if (request.method.toLowerCase() === 'head') fileResponseBytes = null;
                if (request.headers['connection'] === 'keep-alive') keepAlive = true;

                var response = this._responseBuilder.createResponse(fileResponseBytes, responseHeaders);

                this._socketSender.send(request.socket, response, keepAlive);
            });
        }
        catch (e) {
            console.warn(e);
            this._httpResponder.sendErrorResponse(request.socket);
        }
    }
}

module.exports = FileResponder;