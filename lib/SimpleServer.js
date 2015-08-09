"use strict";
const Constants = require('./Constants');

class SimpleServer {
    constructor(httpServer, urlProvider, md5) {
        this._httpServer = httpServer;
        this._urlProvider = urlProvider;
        this._md5 = md5;
		this.port = null;
    }
	start() {
		this.port = this._httpServer.start();
		return this.port;
	}
	stop() {
		this._httpServer.stop();
		delete this.port;
		this._httpServer.registeredFiles = {};
		this._httpServer.registeredPaths = {};
	}
	registerFile(file, serverIP) {
		let filePathHash = this._md5(file.path);
		let filePath = `/${filePathHash}/${file.name}`;
		let pathname = encodeURI(filePath).toLowerCase();

        if (!file.isLocal && this._urlProvider.isValidUri(file.path))
			return file.path;

		this._httpServer.registeredFiles[pathname] = file.path;
		return `http://${serverIP}:${this._httpServer.port}${pathname}`;
	}
	registerPath(serverPath, callback) {
		serverPath = serverPath.toLowerCase();
		if (callback) this._httpServer.registeredPaths[serverPath] = callback;
		else delete this._httpServer.registeredPaths[serverPath];
	}
}
module.exports = SimpleServer;