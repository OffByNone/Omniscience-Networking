'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var ResponseBuilder = (function () {
		function ResponseBuilder(networkingUtils) {
				_classCallCheck(this, ResponseBuilder);

				this._networkingUtils = networkingUtils;
		}

		_createClass(ResponseBuilder, [{
				key: 'createResponseHeaders',
				value: function createResponseHeaders(requestHeaders, mimetype, contentLength, eTag) {
						//todo: validate parameters
						var contentType = mimetype;
						var connection = requestHeaders['connection'] ? Constants.connectionKeepAlive : Constants.connectionClose;
						var httpStatus = requestHeaders['range'] ? Constants.httpPartialStatus : Constants.httpOkStatus;
						var date = new Date().toUTCString();

						var _networkingUtils$parseRange = this._networkingUtils.parseRange(requestHeaders['range']);

						var _networkingUtils$parseRange2 = _slicedToArray(_networkingUtils$parseRange, 2);

						var start = _networkingUtils$parseRange2[0];
						var end = _networkingUtils$parseRange2[1];

						end = end || contentLength;
						var actualLength = Number(end) - Number(start);

						var headers = ['' + Constants.httpVersion + ' ' + httpStatus.code + ' ' + httpStatus.reason, 'Server: ' + Constants.serverName, 'Content-Type: ' + contentType, 'Connection: ' + connection, 'Content-Length: ' + actualLength, 'ETag: ' + eTag, 'Date: ' + date, 'Accept-Ranges: bytes', 'Cache-Control: no-cache'];

						if (requestHeaders['range']) headers.push('Content-Range: bytes ' + start + '-' + end + '/' + contentLength);

						return this._networkingUtils.toByteArray(headers.join(Constants.headerLineDelimiter) + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
				}
		}]);

		return ResponseBuilder;
})();

module.exports = ResponseBuilder;
//# sourceMappingURL=ResponseBuilder.js.map