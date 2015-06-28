'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Constants = require('./Constants');

var SocketSender = (function () {
	function SocketSender() {
		_classCallCheck(this, SocketSender);
	}

	_createClass(SocketSender, [{
		key: 'send',
		value: function send(socket, message, keepAlive) {
			socket.ondrain = this.sendNextPart;
			this.sendNextPart(socket, 0, message.length, message, keepAlive);
		}
	}, {
		key: 'sendNextPart',
		value: function sendNextPart(socket, offset, remaining, response, keepAlive) {
			var amountToSend = Math.min(remaining, Constants.socketBufferSize);
			var bufferFull = socket.send(response, offset, amountToSend);

			offset += amountToSend;
			remaining -= amountToSend;

			if (remaining > 0) {
				if (!bufferFull) this.sendNextPart(socket, offset, remaining, response);
			} else if (!keepAlive) {
				socket.close(); //todo: make timer and add params to keep alive so we can time it out, once keep alive is over
			}
		}
	}]);

	return SocketSender;
})();

module.exports = SocketSender;