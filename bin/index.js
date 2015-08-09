'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var SimpleServer = require('./SimpleServer');
var NetworkingUtils = require('./NetworkingUtils');
var SdkResolver = require('omniscience-sdk-resolver');

var _require = require('omniscience-utilities');

var Utilities = _require.Utilities;

var HttpServer = require('./Firefox/HttpServer');
var HttpRequestParser = require('./Firefox/HttpRequestParser');
var HttpResponder = require('./Firefox/HttpResponder');
var FileResponder = require('./Firefox/FileResponder');
var ResponseBuilder = require('./Firefox/ResponseBuilder');
var HttpRequestHandler = require('./Firefox/HttpRequestHandler');

var Networking = (function () {
	function Networking() {
		_classCallCheck(this, Networking);

		this._sdk = new SdkResolver().resolve();
		this._utilities = new Utilities();
	}

	_createClass(Networking, [{
		key: 'createSimpleServer',
		value: function createSimpleServer() {
			var httpServer = undefined;

			if (this._sdk.isFirefox) httpServer = new HttpServer(this._sdk.RawTCPProvider, this._utilities.createUrlProvider(), new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()), new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)), this._sdk.timers(), new FileResponder(this._sdk.FileUtilities, new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()), NetworkingUtils, this._sdk.createSocketSender(), new ResponseBuilder(this._sdk.FileUtilities, NetworkingUtils)));else if (this._sdk.isChrome) httpServer = new HttpServer();

			return new SimpleServer(httpServer, this._utilities.createUrlProvider, this._utilities.MD5());
		}
	}]);

	return Networking;
})();

module.exports = Networking;