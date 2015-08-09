"use strict";


const SimpleServer = require('./SimpleServer');
const NetworkingUtils = require('./NetworkingUtils');
const SdkResolver = require("omniscience-sdk-resolver");
const { Utilities } = require('omniscience-utilities');


const HttpServer = require('./Firefox/HttpServer');
const HttpRequestParser = require('./Firefox/HttpRequestParser');
const HttpResponder = require('./Firefox/HttpResponder');
const FileResponder = require('./Firefox/FileResponder');
const ResponseBuilder = require('./Firefox/ResponseBuilder');
const HttpRequestHandler = require('./Firefox/HttpRequestHandler');

class Networking {
	constructor() {
		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}

	createSimpleServer() {
		let httpServer;

		if (this._sdk.isFirefox)
			httpServer = new HttpServer(
				this._sdk.RawTCPProvider,
				this._utilities.createUrlProvider(),
				new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()),
				new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)),
				this._sdk.timers(),
				new FileResponder(
					this._sdk.FileUtilities,
					new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()),
					NetworkingUtils,
					this._sdk.createSocketSender(),
					new ResponseBuilder(this._sdk.FileUtilities, NetworkingUtils)));
		else if (this._sdk.isChrome)
			httpServer = new HttpServer();

		return new SimpleServer(httpServer, this._utilities.createUrlProvider, this._utilities.MD5());
	}
}

module.exports = Networking;