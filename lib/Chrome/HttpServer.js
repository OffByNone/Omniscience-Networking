"use strict";
const Constants = require('../Constants');
const HttpRequest = require('../HttpRequest');

class HttpServer {
	constructor(urlProvider, httpResponder, httpRequestHandler, timer, fileResponder, chromeTCPServer, chromeTCP) {
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

	start() {
		if (this.isRunning) return;

		if (!this.port) this.port = this._getRandomPort();

		//todo: should this be persistent?
		this._chromeTCPServer.create({ persistent: false, name: "httpServerSocket" }, ({socketId}) => {
			this._socketId = socketId;

			this._chromeTCPServer.listen(this._socketId, this.localAddress, this.port, null, (resultCode) => {
				if (resultCode < 0) {
					console.log(resultCode);
					this.isRunning = false;
				}
			})
		});

		this._chromeTCPServer.onAccept.addListener(({socketId, clientSocketId}) => {
			if (this._socketId !== socketId) return;
			
			let httpRequest = new HttpRequest();

			this._chromeTCP.onReceive.addListener(({ socketId, data }) => {
				if (socketId !== clientSocketId) return;

				this._httpRequestHandler.handleRequest(socketId, data, httpRequest,
					(request) => this._onRequestSuccess(request),
					(request, error) => this._onRequestError(request, error));
			});
			this._chromeTCP.setPaused(clientSocketId, false);
		});

		this._chromeTCPServer.onAcceptError.addListener(({socketId, resultCode}) => {
			console.log("error on socket " + socketId + " code: " + resultCode);
			this._chromeTCPServer.setPaused(socketId, false);
		});

		this.isRunning = true;

		return this.port;
	}
	stop() {
		if (!this.isRunning) return;
		this._chromeTCPServer.close(this._socketId, () => this.isRunning = false);
	}
	_getRandomPort() {
		return Math.floor(Math.random() * (65535 - 10000)) + 10000;
	}
	_onRequestSuccess(request) {
		//todo: look into whether or not the below is actually a good idea
		//todo: the firefox server clears the timeout when the socket closes, as it has
		//an onclose event.  As far as I can tell chrome's doesn't.  See if we can detect onclose this
		//if the socket is already closed chrome throws two errors
		//Unchecked runtime.lastError while running sockets.tcp.getInfo: Socket not found
		//and
		//Error in response to sockets.tcp.getInfo: TypeError: Cannot read property 'connected' of undefined
		let timeout = this._timer.setTimeout(() => {
			this._chromeTCP.getInfo(request.socket, ({connected, peerAddress}) => {
				if (connected)
					this._httpResponder.sendTimeoutResponse(request.socket);
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
	_onRequestError(request, err) {
		this._chromeTCP.getInfo(request.socket, ({connected, peerAddress}) => {
			if (connected)
				this._httpResponder.sendErrorResponse(request.socket);

			console.warn('bad request received from ' + peerAddress);
		});
	}
}
module.exports = HttpServer;