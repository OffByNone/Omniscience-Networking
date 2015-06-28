'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var HttpServer = (function () {
	function HttpServer(tcpSocket, urlProvider, httpResponder, requestParser, timer, fileResponder) {
		_classCallCheck(this, HttpServer);

		this._tcpSocket = tcpSocket;
		this._urlProvider = urlProvider;
		this._httpResponder = httpResponder;
		this._requestParser = requestParser;
		this._timer = timer;
		this._fileResponder = fileResponder;

		this.isRunning = false;
		this._registeredPaths = [];
		this._registeredFiles = [];
	}

	_createClass(HttpServer, [{
		key: 'start',
		value: function start() {
			var _this = this;

			if (this.isRunning) return;

			this.port = this._getRandomPort();
			this.socket = this._tcpSocket.listen(this.port, { binaryType: 'arraybuffer' });

			console.log('listening on port ' + this.port);

			this.socket.onconnect = function (incomingSocket) {
				_this._requestParser.parseRequest(incomingSocket, function (request) {
					return _this._handleRequest(incomingSocket, request);
				}, function (error) {
					return _this._handleError(incomingSocket, error);
				});
			};

			this.isRunning = true;
		}
	}, {
		key: 'stop',
		value: function stop() {
			if (!this.isRunning) return;
			this.socket.close();
			this.isRunning = false;
		}
	}, {
		key: '_getRandomPort',
		value: function _getRandomPort() {
			return Math.floor(Math.random() * (65535 - 10000)) + 10000;
		}
	}, {
		key: '_handleRequest',
		value: function _handleRequest(incomingSocket, request) {
			var _this2 = this;

			var timeout = this._timer.setTimeout(function () {
				if (incomingSocket.readyState === 'open') //todo: check for ready state change, listen for close and remove timeout handler
					_this2._httpResponder.sendTimeoutResponse(incomingSocket);
			}, Constants.serverTimeoutInMilliseconds);

			if (this._registeredPaths.hasOwnProperty(request.path)) {
				this._registeredPaths[request.path](request);
				return;
			}

			if (this._registeredFiles.hasOwnProperty(request.path)) {
				this._fileResponder.sendResponse(request, this._registeredFiles[request.path]);
				return;
			}

			this._httpResponder.sendFileNotFoundResponse(incomingSocket);
		}
	}, {
		key: '_handleError',
		value: function _handleError(incomingSocket, error) {
			if (incomingSocket.readyState === 'open') this._httpResponder.sendErrorResponse(incomingSocket);
			console.warn('bad request received');
		}
	}, {
		key: 'registerFile',
		value: function registerFile(serverPath, filepath) {
			var pathname = this._urlProvider.createUrl(serverPath.toLowerCase(), 'http://localhost/').pathname;
			if (filepath) this._registeredFiles[pathname] = filepath;else delete this._registeredFiles[pathname];
			return pathname;
		}
	}, {
		key: 'registerPath',
		value: function registerPath(serverPath, callback) {
			var pathname = this._urlProvider.createUrl(serverPath.toLowerCase(), 'http://localhost/').pathname;
			if (callback) this._registeredPaths[pathname] = callback;else delete this._registeredPaths[pathname];
			return pathname;
		}
	}]);

	return HttpServer;
})();

module.exports = HttpServer;