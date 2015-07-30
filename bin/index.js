'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var FileSharer = require('./FileSharer');
var HttpServer = require('./HttpServer');
var HttpRequestParser = require('./HttpRequestParser');
var NetworkingUtils = require('./NetworkingUtils');
var SocketSender = require('./SocketSender');
var HttpResponder = require('./HttpResponder');
var FileResponder = require('./FileResponder');
var ResponseBuilder = require('./ResponseBuilder');
var TCPCommunicator = require('./TCPCommunicator');
var TCPSocketProvider = require('./TCPSocketProvider');
var HttpRequestHandler = require('./HttpRequestHandler');

var SdkResolver = require('omniscience-sdk-resolver');

var _require = require('omniscience-utilities');

var Utilities = _require.Utilities;

var Networking = (function () {
	function Networking() {
		_classCallCheck(this, Networking);

		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}

	_createClass(Networking, [{
		key: 'createHttpServer',
		value: function createHttpServer() {
			return new HttpServer(new TCPSocketProvider(this._sdk.createTCPSocket), this._utilities.createUrlProvider(), new HttpResponder(NetworkingUtils, new SocketSender()), new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)), this._sdk.timers(), new FileResponder(this._sdk.FileUtilities, new HttpResponder(NetworkingUtils, new SocketSender()), NetworkingUtils, new SocketSender(), new ResponseBuilder(this._sdk.FileUtilities, NetworkingUtils)));
		}
	}, {
		key: 'createFileSharer',
		value: function createFileSharer(httpServer) {
			return new FileSharer(httpServer, this._utilities.createUrlProvider, this._utilities.MD5());
		}
	}, {
		key: 'createTCPCommunicator',
		value: function createTCPCommunicator() {
			return new TCPCommunicator(this._sdk.timers(), new TCPSocketProvider(this._sdk.createTCPSocket), new SocketSender());
		}
	}]);

	return Networking;
})();

module.exports = Networking;