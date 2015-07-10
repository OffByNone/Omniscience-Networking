'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');
var HttpRequest = require('./HttpRequest');

var HttpRequestParser = (function () {
	function HttpRequestParser(networkingUtils) {
		_classCallCheck(this, HttpRequestParser);

		this._networkingUtils = networkingUtils;
	}

	_createClass(HttpRequestParser, [{
		key: 'parseUrlParams',
		value: function parseUrlParams(params) {
			if (!params) return null;

			var parsedParams = {};
			params.split('&').forEach(function (keyValue) {
				var _decodeURIComponent$split = decodeURIComponent(keyValue).split('=');

				var _decodeURIComponent$split2 = _slicedToArray(_decodeURIComponent$split, 2);

				var key = _decodeURIComponent$split2[0];
				var value = _decodeURIComponent$split2[1];

				parsedParams[key] = value;
			});

			return parsedParams;
		}
	}, {
		key: 'separateBodyFromHead',
		value: function separateBodyFromHead(data) {
			if (!data) return null;

			var dataStr = this._networkingUtils.toString(data);
			return dataStr.split(Constants.headerLineDelimiter + Constants.headerLineDelimiter);
		}
	}, {
		key: 'parseMetadata',
		value: function parseMetadata(metadata) {
			if (!metadata) return null;

			var _metadata$split = metadata.split(Constants.headerLineDelimiter);

			var _metadata$split2 = _toArray(_metadata$split);

			var requestLine = _metadata$split2[0];

			var headerLines = _metadata$split2.slice(1);

			var _requestLine$split = requestLine.split(Constants.requestLineDelimiter);

			var _requestLine$split2 = _slicedToArray(_requestLine$split, 3);

			var method = _requestLine$split2[0];
			var uri = _requestLine$split2[1];
			var protocol = _requestLine$split2[2];

			if (protocol !== Constants.httpVersion) return null;

			var _uri$split = uri.split('?');

			var _uri$split2 = _slicedToArray(_uri$split, 2);

			var path = _uri$split2[0];
			var params = _uri$split2[1];

			var parameters = this.parseUrlParams(params);

			var headers = {};
			headerLines.forEach(function (headerLine) {
				var _headerLine$split = headerLine.split(':');

				var _headerLine$split2 = _slicedToArray(_headerLine$split, 2);

				var name = _headerLine$split2[0];
				var value = _headerLine$split2[1];

				if (!name || !value) return;
				headers[name.toLowerCase()] = value.toLowerCase();
			});

			return { headers: headers, method: method, parameters: parameters, path: path.toLowerCase() };
		}
	}]);

	return HttpRequestParser;
})();

module.exports = HttpRequestParser;