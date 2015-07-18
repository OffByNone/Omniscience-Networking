"use strict";
const Constants = require('./Constants');
const HttpRequest = require('./HttpRequest');

class HttpServer {
	constructor(tcpSocket, urlProvider, httpResponder, httpRequestHandler, timer, fileResponder) {
		this._tcpSocket = tcpSocket;
		this._urlProvider = urlProvider;
		this._httpResponder = httpResponder;
		this._timer = timer;
		this._fileResponder = fileResponder;
		this._httpRequestHandler = httpRequestHandler;

		this.isRunning = false;
		this._registeredPaths = [];
		this._registeredFiles = [];
	}

	start() {
		if (this.isRunning) return;

		if(!this.port) this.port = this._getRandomPort();
		this.socket = this._tcpSocket.listen(this.port, { binaryType: "arraybuffer" });

		console.log('listening on port ' + this.port);

		this.socket.onconnect = (incomingSocket) => {
			let httpRequest = new HttpRequest();
			incomingSocket.ondata = (event) =>
				this._httpRequestHandler.handleRequest(incomingSocket, event.data, httpRequest,
					(request) => this._onRequestSuccess(request),
					(request, error) => this._onRequestError(request, error));
		};

		this.isRunning = true;
	}
	stop() {
		if (!this.isRunning) return;
		this.socket.close();
		this.isRunning = false;
	}
	_getRandomPort() {
		return Math.floor(Math.random() * (65535 - 10000)) + 10000;
	}
	_onRequestSuccess(request) {
		let timeout = this._timer.setTimeout(() => {
			if (request.socket.readyState === 'open')
				this._httpResponder.sendTimeoutResponse(request.socket);
		}, Constants.serverTimeoutInMilliseconds);

		request.socket.onclose = () => this._timer.clearTimeout(timeout);

		if (this._registeredPaths.hasOwnProperty(request.path)) {
			this._registeredPaths[request.path](request);
			return;
		}

		if (this._registeredFiles.hasOwnProperty(request.path)) {
			this._fileResponder.sendResponse(request, this._registeredFiles[request.path]);
			return;
		}

		this._httpResponder.sendFileNotFoundResponse(request.socket);
	}
	_onRequestError(request, err) {
		if (request.socket.readyState === 'open')
			this._httpResponder.sendErrorResponse(request.socket);
		console.warn('bad request received');
	}
	registerFile(serverPath, filepath) {
		let pathname = this._urlProvider.createUrl(serverPath.toLowerCase(), "http://localhost/").pathname;
		if (filepath) this._registeredFiles[pathname] = filepath;
		else delete this._registeredFiles[pathname];
		return pathname;
	}
	registerPath(serverPath, callback) {
		let pathname = this._urlProvider.createUrl(serverPath.toLowerCase(), "http://localhost/").pathname;
		if (callback) this._registeredPaths[pathname] = callback;
		else delete this._registeredPaths[pathname];
		return pathname;
	}
}
module.exports = HttpServer;