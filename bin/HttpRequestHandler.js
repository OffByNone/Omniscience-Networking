'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');
var HttpRequest = require('./HttpRequest');

var HttpRequestHandler = (function () {
	function HttpRequestHandler(networkingUtils, httpRequestParser) {
		_classCallCheck(this, HttpRequestHandler);

		this._networkingUtils = networkingUtils;
		this._httpRequestParser = httpRequestParser;
	}

	_createClass(HttpRequestHandler, [{
		key: 'handleRequest',
		value: function handleRequest(socket, eventData, request, success, failure) {
			var packetBodyBytes;

			if (request.bytes.receivedTotal === 0) {
				request.socket = socket;

				var _httpRequestParser$separateBodyFromHead = this._httpRequestParser.separateBodyFromHead(eventData);

				var _httpRequestParser$separateBodyFromHead2 = _slicedToArray(_httpRequestParser$separateBodyFromHead, 2);

				var head = _httpRequestParser$separateBodyFromHead2[0];
				var body = _httpRequestParser$separateBodyFromHead2[1];

				var metadata = this._httpRequestParser.parseMetadata(head);
				if (!metadata) {
					failure(request, 'metadata not parsable.');
					return;
				}

				packetBodyBytes = this._networkingUtils.toByteArray(body);

				request.headers = metadata.headers;
				request.parameters = metadata.parameters;
				request.method = metadata.method;
				request.path = metadata.path;
				request.bytes.total = parseInt(request.headers['content-length'], 10);
			} else packetBodyBytes = eventData;

			request.bytes.receivedTotal += eventData.byteLength;
			request.bytes.receivedBody += packetBodyBytes.byteLength;
			request.bytes.body.push(packetBodyBytes);

			if (isNaN(request.bytes.total) || request.bytes.receivedTotal >= request.bytes.total) {
				var _networkingUtils;

				var mergedBody = (_networkingUtils = this._networkingUtils).merge.apply(_networkingUtils, _toConsumableArray(request.bytes.body));
				request.body = this._networkingUtils.toString(mergedBody);
				success(request);
			}
		}
	}]);

	return HttpRequestHandler;
})();

module.exports = HttpRequestHandler;