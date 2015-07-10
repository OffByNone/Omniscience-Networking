'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var HttpResponder = (function () {
    function HttpResponder(networkingUtils, socketSender) {
        _classCallCheck(this, HttpResponder);

        this._networkingUtils = networkingUtils;
        this._socketSender = socketSender;
    }

    _createClass(HttpResponder, [{
        key: 'sendOkResponse',
        value: function sendOkResponse(socket) {
            this._sendResponse(socket, Constants.httpOkStatus);
        }
    }, {
        key: 'sendFileNotFoundResponse',
        value: function sendFileNotFoundResponse(socket) {
            this._sendResponse(socket, Constants.httpFileNotFoundStatus);
        }
    }, {
        key: 'sendTimeoutResponse',
        value: function sendTimeoutResponse(socket) {
            this._sendResponse(socket, Constants.httpTimeoutStatus);
        }
    }, {
        key: 'sendErrorResponse',
        value: function sendErrorResponse(socket) {
            this._sendResponse(socket, Constants.httpErrorStatus);
        }
    }, {
        key: '_sendResponse',
        value: function _sendResponse(socket, httpStatus) {
            var headers = ['' + Constants.httpVersion + ' ' + httpStatus.code + ' ' + httpStatus.reason, 'Server: ' + Constants.serverName, 'Content-Type: text\\plain', 'Connection: close', 'Content-Length: 0'];

            var headersBuffer = this._networkingUtils.toByteArray(headers.join(Constants.headerLineDelimiter)).buffer;
            this._socketSender.send(socket, headersBuffer, false);
        }
    }]);

    return HttpResponder;
})();

module.exports = HttpResponder;