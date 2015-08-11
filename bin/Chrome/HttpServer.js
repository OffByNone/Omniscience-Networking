"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('../Constants');
var HttpRequest = require('../HttpRequest');

var HttpServer = (function () {
	function HttpServer(urlProvider, httpResponder, httpRequestHandler, timer, fileResponder, chromeTCPServer, chromeTCP) {
		_classCallCheck(this, HttpServer);

		this._chromeTCPServer = chromeTCPServer;
		this._chromeTCP = chromeTCP;
		this._urlProvider = urlProvider;
		this._httpResponder = httpResponder;
		this._timer = timer;
		this._fileResponder = fileResponder;
		this._httpRequestHandler = httpRequestHandler;

		this.isRunning = false;
		this.port = null;
		this.localAddress = "0.0.0.0";
		this.registeredPaths = {};
		this.registeredFiles = {};
	}

	_createClass(HttpServer, [{
		key: 'start',
		value: function start() {
			var _this = this;

			if (this.isRunning) return;

			if (!this.port) this.port = this._getRandomPort();

			//todo: should this be persistent?
			this._chromeTCPServer.create({ persistent: false, name: "httpServerSocket" }, function (_ref) {
				var socketId = _ref.socketId;

				_this._socketId = socketId;

				_this._chromeTCPServer.listen(_this._socketId, _this.localAddress, _this.port, null, function (resultCode) {
					if (resultCode < 0) {
						console.log(resultCode);
						_this.isRunning = false;
					}
				});
			});

			this._chromeTCP.onReceive.addListener(function (_ref2) {
				var socketId = _ref2.socketId;
				var data = _ref2.data;

				var httpRequest = new HttpRequest();

				if (socketId !== socketId) return;

				_this._httpRequestHandler.handleRequest(socketId, data, httpRequest, function (request) {
					return _this._onRequestSuccess(request);
				}, function (request, error) {
					return _this._onRequestError(request, error);
				});
			});
			this._chromeTCPServer.onAccept.addListener(function (_ref3) {
				var socketId = _ref3.socketId;
				var clientSocketId = _ref3.clientSocketId;

				_this._chromeTCP.setPaused(clientSocketId, false);
			});

			this._chromeTCPServer.onAcceptError.addListener(function (_ref4) {
				var socketId = _ref4.socketId;
				var resultCode = _ref4.resultCode;

				console.log("error on socket " + socketId + " code: " + resultCode);
				_this._chromeTCPServer.setPaused(socketId, false);
			});

			this.isRunning = true;

			return this.port;
		}
	}, {
		key: 'stop',
		value: function stop() {
			var _this2 = this;

			if (!this.isRunning) return;
			this._chromeTCPServer.close(this._socketId, function () {
				return _this2.isRunning = false;
			});
		}
	}, {
		key: '_getRandomPort',
		value: function _getRandomPort() {
			return Math.floor(Math.random() * (65535 - 10000)) + 10000;
		}
	}, {
		key: '_onRequestSuccess',
		value: function _onRequestSuccess(request) {
			var _this3 = this;

			//todo: look into whether or not the below is actually a good idea
			//todo: the firefox server clears the timeout when the socket closes, as it has
			//an onclose event.  As far as I can tell chrome's doesn't.  See if we can detect onclose this
			//if the socket is already closed chrome throws two errors
			//Unchecked runtime.lastError while running sockets.tcp.getInfo: Socket not found
			//and
			//Error in response to sockets.tcp.getInfo: TypeError: Cannot read property 'connected' of undefined
			var timeout = this._timer.setTimeout(function () {
				_this3._chromeTCP.getInfo(request.socket, function (_ref5) {
					var connected = _ref5.connected;
					var peerAddress = _ref5.peerAddress;

					if (connected) _this3._httpResponder.sendTimeoutResponse(request.socket);
				});
			}, Constants.serverTimeoutInMilliseconds);

			request.path = request.path.toLowerCase();

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
			var _this4 = this;

			this._chromeTCP.getInfo(request.socket, function (_ref6) {
				var connected = _ref6.connected;
				var peerAddress = _ref6.peerAddress;

				if (connected) _this4._httpResponder.sendErrorResponse(request.socket);

				console.warn('bad request received from ' + peerAddress);
			});
		}
	}]);

	return HttpServer;
})();

module.exports = HttpServer;