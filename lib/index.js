const FileSharer = require('./FileSharer');
const HttpServer = require('./HttpServer');
const HttpRequestParser = require('./HttpRequestParser');
const NetworkingUtils = require('./NetworkingUtils');
const SocketSender = require('./SocketSender');
const HttpResponder = require('./HttpResponder');
const FileResponder = require('./FileResponder');
const Constants = require('./Constants');
const TCPCommunicator = require('./TCPCommunicator');
const TCPSocketProvider = require('./TCPSocketProvider');

const SdkResolver = require("omniscience-sdk-resolver");
const utils = require('omniscience-utilities');

class Networking {
	constructor() {
		this._sdk = new SdkResolver().resolve();
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
	createTCPCommunicator() { 
		return new TCPCommunicator(this._sdk.timers(), new TCPSocketProvider(), new SocketSender());
	}
}

module.exports = Networking;