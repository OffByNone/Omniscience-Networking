"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('./Constants');

var SimpleServer = (function () {
	function SimpleServer(httpServer, urlProvider, md5) {
		_classCallCheck(this, SimpleServer);

		this._httpServer = httpServer;
		this._urlProvider = urlProvider;
		this._md5 = md5;
		this.port = null;
	}

	_createClass(SimpleServer, [{
		key: "start",
		value: function start() {
			this.port = this._httpServer.start();
			return this.port;
		}
	}, {
		key: "stop",
		value: function stop() {
			this._httpServer.stop();
			delete this.port;
			this._httpServer.registeredFiles = {};
			this._httpServer.registeredPaths = {};
		}
	}, {
		key: "registerFile",
		value: function registerFile(file, serverIP) {
			var filePathHash = this._md5(file.path);
			var filePath = "/" + filePathHash + "/" + file.name;
			var pathname = encodeURI(filePath).toLowerCase();

			if (!file.isLocal && this._urlProvider.isValidUri(file.path)) return file.path;

			this._httpServer.registeredFiles[pathname] = file.path;
			return "http://" + serverIP + ":" + this._httpServer.port + pathname;
		}
	}, {
		key: "registerPath",
		value: function registerPath(serverPath, callback) {
			serverPath = serverPath.toLowerCase();
			if (callback) this._httpServer.registeredPaths[serverPath] = callback;else delete this._httpServer.registeredPaths[serverPath];
		}
	}]);

	return SimpleServer;
})();

module.exports = SimpleServer;