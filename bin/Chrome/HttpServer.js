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
		this.incomingConnections = {};
	}

	_createClass(HttpServer, [{
		key: 'start',
		value: function start() {
			var _this = this;

			if (this.isRunning) return;

			this.isRunning = true;
			if (!this.port) this.port = this._getRandomPort();

			this._chromeTCP.onReceive.addListener(function (_ref) {
				var socketId = _ref.socketId;
				var data = _ref.data;

				if (!_this.incomingConnections.hasOwnProperty(socketId)) return; //connection is not to this server

				var httpRequest = _this.incomingConnections[socketId];
				_this._httpRequestHandler.handleRequest(socketId, data, httpRequest, function (request) {
					return _this._onRequestSuccess(request);
				}, function (request, error) {
					return _this._onRequestError(request, error);
				});
			});

			this._chromeTCPServer.onAccept.addListener(function (_ref2) {
				var socketId = _ref2.socketId;
				var clientSocketId = _ref2.clientSocketId;

				if (_this._socketId !== socketId) return; //connection is not to this server

				_this.incomingConnections[clientSocketId] = new HttpRequest();
				_this._chromeTCP.setPaused(clientSocketId, false);
			});

			this._chromeTCPServer.onAcceptError.addListener(function (_ref3) {
				var socketId = _ref3.socketId;
				var resultCode = _ref3.resultCode;

				console.log("error on socket " + socketId + " code: " + resultCode);
				_this._chromeTCPServer.setPaused(socketId, false);
			});

			//todo: should this be persistent?
			this._chromeTCPServer.create({ persistent: false, name: "httpServerSocket" }, function (_ref4) {
				var socketId = _ref4.socketId;

				_this._socketId = socketId;

				_this._chromeTCPServer.listen(_this._socketId, _this.localAddress, _this.port, null, function (resultCode) {
					if (resultCode < 0) {
						console.log(resultCode);
						_this.isRunning = false;
					}
				});
			});

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
			//if the socket is already closed chrome throws two errors:
			//	Unchecked runtime.lastError while running sockets.tcp.getInfo: Socket not found
			//	and
			//	Error in response to sockets.tcp.getInfo: TypeError: Cannot read property 'connected' of undefined

			delete this.incomingConnections[request.socket]; //request.socket is the socketId, we now have the entire message so we dont need this anymore

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

			if (this.incomingConnections.hasOwnProperty(request.socket)) delete this.incomingConnections[request.socket]; //request.socket is the socketId

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