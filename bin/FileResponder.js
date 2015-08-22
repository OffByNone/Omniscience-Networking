'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var FileResponder = (function () {
	function FileResponder(fileUtils, httpResponder, networkingUtils, socketSender, responseBuilder, md5) {
		_classCallCheck(this, FileResponder);

		this._httpResponder = httpResponder;
		this._fileUtils = fileUtils;
		this._networkingUtils = networkingUtils;
		this._socketSender = socketSender;
		this._responseBuilder = responseBuilder;
		this._md5 = md5;
	}

	_createClass(FileResponder, [{
		key: 'sendResponse',
		value: function sendResponse(request, filePath) {
			var _this = this;

			this._fileUtils.readBytes(filePath).then(function (_ref) {
				var fileBytes = _ref.fileBytes;
				var mimetype = _ref.mimetype;

				var keepAlive = false;

				var _networkingUtils$parseRange = _this._networkingUtils.parseRange(request.headers['range']);

				var _networkingUtils$parseRange2 = _slicedToArray(_networkingUtils$parseRange, 2);

				var start = _networkingUtils$parseRange2[0];
				var end = _networkingUtils$parseRange2[1];

				end = end || fileBytes.byteLength;

				var newBuffer = fileBytes.buffer.slice(start, end);
				var fileResponseBytes = new Uint8Array(newBuffer);

				var responseHeaders = _this._responseBuilder.createResponseHeaders(request.headers, mimetype, fileBytes.byteLength, _this._md5(fileResponseBytes.toString()));
				if (request.method.toLowerCase() === 'head') fileResponseBytes = null;
				if (request.headers['connection'] === 'keep-alive') keepAlive = true;

				_this._socketSender.send(request.socket, responseHeaders.buffer, true).then(function () {
					_this._socketSender.send(request.socket, fileResponseBytes.buffer, keepAlive);
				});
			}, function (err) {
				console.warn(err);
				_this._httpResponder.sendErrorResponse(request.socket);
			});
		}
	}]);

	return FileResponder;
})();

module.exports = FileResponder;
//# sourceMappingURL=FileResponder.js.map