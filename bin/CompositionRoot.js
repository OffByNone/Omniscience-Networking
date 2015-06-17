'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var HttpServer = require('./lib/HttpServer');
var HttpResponder = require('./lib/HttpResponder');
var HttpRequestParser = require('./lib/HttpRequestParser');
var NetworkingUtils = require('./lib/NetworkingUtils');
var SocketSender = require('./lib/SocketSender');
var FileResponder = require('./lib/FileResponder');
var Constants = require('./lib/Constants');

var utils = require('omniscienceutilities');

var CompositionRoot = (function () {
	function CompositionRoot(sdk) {
		_classCallCheck(this, CompositionRoot);

		this._sdk = sdk;
	}

	_createClass(CompositionRoot, [{
		key: 'createHttpServer',
		value: function createHttpServer() {
			return new HttpServer(this._sdk.createTCPSocket(), utils.createUrlProvider(), new HttpResponder(NetworkingUtils, new SocketSender()), new HttpRequestParser(NetworkingUtils), this._sdk.timers(), new FileResponder(this._sdk.FileUtilities, new HttpResponder(NetworkingUtils, new SocketSender()), NetworkingUtils, new SocketSender()));
		}
	}]);

	return CompositionRoot;
})();

module.exports = CompositionRoot;