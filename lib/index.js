const FileSharer = require('./FileSharer');
const HttpServer = require('./HttpServer');
const HttpRequestParser = require('./HttpRequestParser');
const NetworkingUtils = require('./NetworkingUtils');
const SocketSender = require('./SocketSender');
const HttpResponder = require('./HttpResponder');
const FileResponder = require('./FileResponder');
const ResponseBuilder = require('./ResponseBuilder');
const Constants = require('./Constants');
const TCPCommunicator = require('./TCPCommunicator');
const TCPSocketProvider = require('./TCPSocketProvider');
const HttpRequestHandler = require('./HttpRequestHandler');

const SdkResolver = require("omniscience-sdk-resolver");
const { Utilities } = require('omniscience-utilities');

class Networking {
	constructor() {
		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}
	createHttpServer() {
		return new HttpServer(
			this._sdk.createTCPSocket(),
			this._utilities.createUrlProvider(),
			new HttpResponder(NetworkingUtils, new SocketSender()),
			new HttpRequestHandler(NetworkingUtils,new HttpRequestParser(NetworkingUtils)),
			this._sdk.timers(),
			new FileResponder(
				this._sdk.FileUtilities,
				new HttpResponder(NetworkingUtils, new SocketSender()),
				NetworkingUtils,
				new SocketSender(),
				new ResponseBuilder(this._sdk.FileUtilities, NetworkingUtils)));
	}
	createFileSharer(httpServer){
		return new FileSharer(httpServer, this._utilities.createUrlProvider, this._utilities.MD5());
	}
	createTCPCommunicator() { 
		return new TCPCommunicator(this._sdk.timers(), new TCPSocketProvider(this._sdk.createTCPSocket), new SocketSender());
	}
}

module.exports = Networking;