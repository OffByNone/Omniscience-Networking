'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('../Utilities/Constants');

var FileResponder = (function () {
    function FileResponder(fileUtils, httpResponder, networkingUtils, socketSender) {
        _classCallCheck(this, FileResponder);

        this._httpResponder = httpResponder;
        this._fileUtils = fileUtils;
        this._networkingUtils = networkingUtils;
        this._socketSender = socketSender;
    }

    _createClass(FileResponder, [{
        key: 'sendResponse',
        value: function sendResponse(request, filePath) {
            var _this = this;

            //todo: look into why I am taking a file path, turning it into a file then back into a file path
            //iirc it is because sometimes I get a path, sometimes i get a file.  But I am not sure this is still the case
            //even if it is, there is likely a better way to handle it.
            try {
                var file = this._fileUtils.create(filePath);
                this._fileUtils.readBytes(file.path).then(function (fileBytes) {
                    var keepAlive = false;
                    var offset = _this._networkingUtils.parseRange(request.headers['range']);
                    fileBytes = _this._networkingUtils.offsetBytes(offset, fileBytes);

                    var responseHeaders = _this.createResponseHeaders(request.headers, file, fileBytes.byteLength);
                    if (request.method.toLowerCase() === 'head') fileBytes = null;
                    if (request.headers['connection'] === 'keep-alive') keepAlive = true;

                    var response = _this.createResponse(fileBytes, responseHeaders);

                    _this._socketSender.send(request.socket, response, keepAlive);
                });
            } catch (e) {
                console.log(e);
                this._httpResponder.sendErrorResponse(request.socket);
            }
        }
    }, {
        key: 'createResponseHeaders',
        value: function createResponseHeaders(requestHeaders, file, contentLength) {
            var contentType = this._fileUtils.getMimeType(file);
            var connection = requestHeaders['connection'] ? 'keep-alive' : 'close';
            var httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;

            var headers = ['' + Constants.httpVersion + ' ' + httpStatus.code + ' ' + httpStatus.reason, 'Server: ' + Constants.serverName, 'Content-Type: ' + contentType, 'Connection: ' + connection, 'Content-Length: ' + contentLength];

            return headers.join(Constants.headerLineDelimiter);
        }
    }, {
        key: 'createResponse',
        value: function createResponse(body, headers) {
            if (body && !ArrayBuffer.isView(body)) throw new Error('Body must be a byte array or null.');
            if (typeof headers !== 'string') throw new Error('Headers must be a string');

            var headersByteArray = this._networkingUtils.toByteArray(headers + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
            if (!body) return headersByteArray.buffer;

            return this._networkingUtils.merge(headersByteArray, body);
        }
    }]);

    return FileResponder;
})();

module.exports = FileResponder;