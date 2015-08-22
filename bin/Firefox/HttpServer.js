'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('../Constants');
var HttpRequest = require('../HttpRequest');

var HttpServer = (function () {
	function HttpServer(tcpSocketProvider, urlProvider, httpResponder, httpRequestHandler, timer, fileResponder) {
		_classCallCheck(this, HttpServer);

		this._tcpSocketProvider = tcpSocketProvider;
		this._urlProvider = urlProvider;
		this._httpResponder = httpResponder;
		this._timer = timer;
		this._fileResponder = fileResponder;
		this._httpRequestHandler = httpRequestHandler;

		this.isRunning = false;
		this.port = null;
		this.registeredPaths = {};
		this.registeredFiles = {};
	}

	_createClass(HttpServer, [{
		key: 'start',
		value: function start() {
			var _this = this;

			if (this.isRunning) return;

			if (!this.port) this.port = this._getRandomPort();

			this._socket = this._tcpSocketProvider.create().listen(this.port, { binaryType: 'arraybuffer' });

			this._socket.onconnect(function (incomingSocket) {
				var httpRequest = new HttpRequest();
				incomingSocket.ondata(function (data) {
					return _this._httpRequestHandler.handleRequest(incomingSocket, data, httpRequest, function (request) {
						return _this._onRequestSuccess(request);
					}, function (request, error) {
						return _this._onRequestError(request, error);
					});
				});
			});

			this.isRunning = true;

			return this.port;
		}
	}, {
		key: 'stop',
		value: function stop() {
			if (!this.isRunning) return;
			this._socket.close();
			this.isRunning = false;
		}
	}, {
		key: '_getRandomPort',
		value: function _getRandomPort() {
			return Math.floor(Math.random() * (65535 - 10000)) + 10000;
		}
	}, {
		key: '_onRequestSuccess',
		value: function _onRequestSuccess(request) {
			var _this2 = this;

			/*todo: look into whether or not the below is actually a good idea */
			var timeout = this._timer.setTimeout(function () {}, Constants.serverTimeoutInMilliseconds);

			request.path = request.path.toLowerCase();

			request.socket.onclose = function () {
				return _this2._timer.clearTimeout(timeout);
			};
			if (this.registeredPaths.hasOwnProperty(request.path)) {
				this.registeredPaths[request.path](request);
				return;
			}

			if (this.registeredFiles.hasOwnProperty(request.path)) {
				this._fileResponder.sendResponse(request, this.registeredFiles[request.path]);
				return;
			}

			this._httpResponder.sendFileNotFoundResponse(request.socket);
		}
	}, {
		key: '_onRequestError',
		value: function _onRequestError(request, err) {
			if (request.socket.isOpen()) this._httpResponder.sendErrorResponse(request.socket);
			console.warn('bad request received');
		}
	}]);

	return HttpServer;
})();

module.exports = HttpServer;

/* if (request.socket.isOpen())
 * this._httpResponder.sendTimeoutResponse(request.socket);
 */
//# sourceMappingURL=HttpServer.js.map