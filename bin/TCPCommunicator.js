/* global Promise */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TCPCommunicator = (function () {
	function TCPCommunicator(timers, tcpSocketProvider, socketSender) {
		_classCallCheck(this, TCPCommunicator);

		this.responseTimeout = 5000;
		this._timers = timers;
		this._tcpSocketProvider = tcpSocketProvider;
		this._socketSender = socketSender;
	}

	_createClass(TCPCommunicator, [{
		key: 'send',
		value: function send(ip, port, data, waitForResponse) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				var socket = _this._tcpSocketProvider.createTCPSocket().open(ip, port);
				socket.onopen = function () {
					return _this._onopen(socket, data, waitForResponse, reject);
				};
				socket.onerror = function (err) {
					return reject(err);
				};
				socket.ondata = function (dataReceived) {
					return _this._ondata(dataReceived, socket, resolve);
				};
			});
		}
	}, {
		key: '_onopen',
		value: function _onopen(socket, data, waitForResponse, reject) {
			var _this2 = this;

			this._socketSender.send(socket, data, waitForResponse);
			this._timers.setTimeout(function () {
				try {
					socket.close();
					reject('Device did not respond within ' + _this2.responseTimeout / 1000 + ' seconds.');
				} catch (e) {}
			}, this.responseTimeout);
		}
	}, {
		key: '_ondata',
		value: function _ondata(dataReceived, socket, resolve) {
			//todo: this will only work when the entire response fits into a single packet, need to loop over this and parse it like in the HttpRequestParser, only different
			socket.close();
			resolve(dataReceived);
		}
	}]);

	return TCPCommunicator;
})();

module.exports = TCPCommunicator;

//todo: if the error is anything other than the socket is already closed, throw
//already closed, meaning we already got the response
//nothing to see here, move along