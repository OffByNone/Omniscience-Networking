'use strict';

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

      var headers = ['' + Constants.httpVersion + ' ' + httpStatus.code + ' ' + httpStatus.reason, 'Server: ' + Constants.serverName, 'Content-Type: ' + contentType, 'Connection: ' + connection, 'Content-Length: ' + contentLength, 'Accept-Ranges: bytes'];

      return this._networkingUtils.toByteArray(headers.join(Constants.headerLineDelimiter) + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
    }
  }]);

  return ResponseBuilder;
})();

module.exports = ResponseBuilder;

/*`Transfer-Encoding: chunked`*/