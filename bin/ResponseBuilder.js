"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var ResponseBuilder = (function () {
        function ResponseBuilder(networkingUtils) {
                _classCallCheck(this, ResponseBuilder);

                this._networkingUtils = networkingUtils;
        }

        _createClass(ResponseBuilder, [{
                key: 'createResponseHeaders',
                value: function createResponseHeaders(requestHeaders, mimetype, contentLength) {
                        //todo: validate parameters
                        var contentType = mimetype;
                        var connection = requestHeaders['connection'] ? Constants.connectionKeepAlive : Constants.connectionClose;
                        var httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;

                        var headers = [Constants.httpVersion + ' ' + httpStatus.code + ' ' + httpStatus.reason, 'Server: ' + Constants.serverName, 'Content-Type: ' + contentType, 'Connection: ' + connection, 'Content-Length: ' + contentLength];

                        return headers.join(Constants.headerLineDelimiter);
                }
        }, {
                key: 'createResponse',
                value: function createResponse(body, headers) {
                        if (body && !this._networkingUtils.isArrayBuffer(body)) throw new Error("Body must be a byte array or null.");
                        if (typeof headers !== "string") throw new Error("Headers must be a string");

                        var headersByteArray = this._networkingUtils.toByteArray(headers + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
                        if (!body) return headersByteArray.buffer;

                        return this._networkingUtils.merge(headersByteArray, body);
                }
        }]);

        return ResponseBuilder;
})();

module.exports = ResponseBuilder;