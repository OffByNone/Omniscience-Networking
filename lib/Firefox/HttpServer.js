"use strict";
const Constants = require('../Constants');
const HttpRequest = require('./HttpRequest');

class HttpServer {
	constructor(rawTCPProvider, urlProvider, httpResponder, httpRequestHandler, timer, fileResponder) {
		this._rawTCPProvider = rawTCPProvider;
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

	start() {
		if (this.isRunning) return;

		if (!this.port) this.port = this._getRandomPort();

		this._socket = this._rawTCPProvider.create().listen(this.port, { binaryType: "arraybuffer" });

		this._socket.onconnect(
			(incomingSocket) => {
				let httpRequest = new HttpRequest();
				incomingSocket.ondata((data) =>
					this._httpRequestHandler.handleRequest(incomingSocket, data, httpRequest,
						(request) => this._onRequestSuccess(request),
						(request, error) => this._onRequestError(request, error)));
			});

		this.isRunning = true;

		return this.port;
	}
	stop() {
		if (!this.isRunning) return;
		this._socket.close();
		this.isRunning = false;
	}
	_getRandomPort() {
		return Math.floor(Math.random() * (65535 - 10000)) + 10000;
	}
	_onRequestSuccess(request) {
		let timeout = this._timer.setTimeout(() => {
			if (request.socket.isOpen())
				this._httpResponder.sendTimeoutResponse(request.socket);
		}, Constants.serverTimeoutInMilliseconds);

		request.path = request.path.toLowerCase();

		request.socket.onclose = () => this._timer.clearTimeout(timeout);
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
		if (request.socket.isOpen())
			this._httpResponder.sendErrorResponse(request.socket);
		console.warn('bad request received');
	}
}
module.exports = HttpServer;