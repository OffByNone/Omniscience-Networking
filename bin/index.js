'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var SimpleServer = require('./SimpleServer');
var HttpResponder = require('./HttpResponder');
var NetworkingUtils = require('./NetworkingUtils');
var ResponseBuilder = require('./ResponseBuilder');
var HttpRequestParser = require('./HttpRequestParser');
var HttpRequestHandler = require('./HttpRequestHandler');
var FileResponder = require('./FileResponder');

var SdkResolver = require('omniscience-sdk-resolver');

var _require = require('omniscience-utilities');

var Utilities = _require.Utilities;

var FirefoxServer = require('./Firefox/HttpServer');

var ChromeServer = require('./Chrome/HttpServer');

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

			if (this._sdk.isFirefox) httpServer = new FirefoxServer(this._sdk.createRawTCPProvider(), this._utilities.createUrlProvider(), new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()), new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)), this._sdk.timers(), new FileResponder(this._sdk.createFileUtilities(), new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()), NetworkingUtils, this._sdk.createSocketSender(), new ResponseBuilder(NetworkingUtils)));else if (this._sdk.isChrome) {
				httpServer = new ChromeServer(this._utilities.createUrlProvider(), new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()), new HttpRequestHandler(NetworkingUtils, new HttpRequestParser(NetworkingUtils)), this._sdk.timers(), new FileResponder(this._sdk.createFileUtilities(), new HttpResponder(NetworkingUtils, this._sdk.createSocketSender()), NetworkingUtils, this._sdk.createSocketSender(), new ResponseBuilder(NetworkingUtils)), this._sdk.chromeTCPServer, this._sdk.chromeTCP);
			}

			return new SimpleServer(httpServer, this._utilities.createUrlProvider, this._utilities.MD5());
		}
	}]);

	return Networking;
})();

module.exports = Networking;