const HttpServer = require('./lib/HttpServer');
const HttpResponder = require('./lib/HttpResponder');
const HttpRequestParser = require('./lib/HttpRequestParser');
const NetworkingUtils = require('./lib/NetworkingUtils');
const SocketSender = require('./lib/SocketSender');
const FileResponder = require('./lib/FileResponder');
const Constants = require('./lib/Constants');

const utils = require('omniscienceutilities');

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
}

module.exports = CompositionRoot;