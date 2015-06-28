'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var FileResponder = (function () {
    function FileResponder(fileUtils, httpResponder, networkingUtils, socketSender, responseBuilder) {
        _classCallCheck(this, FileResponder);

        this._httpResponder = httpResponder;
        this._fileUtils = fileUtils;
        this._networkingUtils = networkingUtils;
        this._socketSender = socketSender;
        this._responseBuilder = responseBuilder;
    }

    _createClass(FileResponder, [{
        key: 'sendResponse',
        value: function sendResponse(request, filePath) {
            var _this = this;

            try {
                var file = this._fileUtils.create(filePath);
                this._fileUtils.readBytes(file.path).then(function (fileBytes) {
                    var keepAlive = false;
                    var offset = _this._networkingUtils.parseRange(request.headers['range']);
                    var fileResponseBytes = _this._networkingUtils.offsetBytes(offset, fileBytes);

                    var responseHeaders = _this._responseBuilder.createResponseHeaders(request.headers, file, fileResponseBytes.byteLength);
                    if (request.method.toLowerCase() === 'head') fileResponseBytes = null;
                    if (request.headers['connection'] === 'keep-alive') keepAlive = true;

                    var response = _this._responseBuilder.createResponse(fileResponseBytes, responseHeaders);

                    _this._socketSender.send(request.socket, response, keepAlive);
                });
            } catch (e) {
                console.warn(e);
                this._httpResponder.sendErrorResponse(request.socket);
            }
        }
    }]);

    return FileResponder;
})();

module.exports = FileResponder;