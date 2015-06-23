const FileSharer = require('./FileSharer');
const HttpServer = require('./HttpServer');
const HttpResponder = require('./HttpResponder');
const HttpRequestParser = require('./HttpRequestParser');
const NetworkingUtils = require('./NetworkingUtils');
const SocketSender = require('./SocketSender');
const FileResponder = require('./FileResponder');
const Constants = require('./Constants');

const utils = require('omniscience-utilities');

class CompositionRoot {
	constructor(sdk) {
		this._sdk = sdk;
	}
	createHttpServer() {
		return new HttpServer(this._sdk.createTCPSocket(),
			utils.createUrlProvider(),
			new HttpResponder(NetworkingUtils, new SocketSender()),
			new HttpRequestParser(NetworkingUtils),
			this._sdk.timers(),
			new FileResponder(
				this._sdk.FileUtilities,
				new HttpResponder(NetworkingUtils, new SocketSender()),
				NetworkingUtils,
				new SocketSender()));
	}
	createFileSharer(httpServer){
		return new FileSharer(httpServer, utils.createUrlProvider, utils.MD5());
	}
}

module.exports = CompositionRoot;
