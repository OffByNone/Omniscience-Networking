"use strict";

const SimpleServer = require('./SimpleServer');
const HttpResponder = require('./HttpResponder');
const NetworkingUtils = require('./NetworkingUtils');
const ResponseBuilder = require('./ResponseBuilder');
const HttpRequestParser = require('./HttpRequestParser');
const HttpRequestHandler = require('./HttpRequestHandler');
const FileResponder = require('./FileResponder');

const SdkResolver = require("omniscience-sdk-resolver");
const { Utilities } = require('omniscience-utilities');

const FirefoxServer = require('./Firefox/HttpServer');

const ChromeServer = require('./Chrome/HttpServer');

class Networking {
	constructor() {
		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}

	createSimpleServer() {
		let httpServer;

		if (this._sdk.isFirefox)
			httpServer = new FirefoxServer(
				this._sdk.createRawTCPProvider(),
				this._utilities.createUrlProvider(),
				new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()),
				new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)),
				this._sdk.timers(),
				new FileResponder(
					this._sdk.createFileUtilities(),
					new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()),
					NetworkingUtils,
					this._sdk.createSocketSender(),
					new ResponseBuilder(NetworkingUtils)));
		else if (this._sdk.isChrome) {
			httpServer = new ChromeServer(
				this._utilities.createUrlProvider(),
				new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()),
				new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)),
				this._sdk.timers(),
				new FileResponder(
					this._sdk.createFileUtilities(),
					new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()),
					NetworkingUtils,
					this._sdk.createSocketSender(),
					new ResponseBuilder(NetworkingUtils)),
				this._sdk.chromeTCPServer,
				this._sdk.chromeTCP);
		}

		return new SimpleServer(httpServer, this._utilities.createUrlProvider(), this._utilities.MD5());
	}
}

module.exports = Networking;