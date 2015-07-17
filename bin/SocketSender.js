"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require("./Constants");

var SocketSender = (function () {
	function SocketSender() {
		_classCallCheck(this, SocketSender);
	}

	_createClass(SocketSender, [{
		key: "send",
		value: function send(socket, message, keepAlive) {
			var offset = 0;
			var remainingBytes = socket.binaryType === "arraybuffer" ? message.byteLength : message.length;
			//bytelength is for files, length (binaryType string) is for matchstick commands
			//todo: see if matchstick commands can be sent using arraybuffer
			var sendNextPart = function sendNextPart() {
				var amountToSend = Math.min(remainingBytes, Constants.socketBufferSize);
				var bufferFull = false;
				if (amountToSend !== 0) {
					bufferFull = socket.send(message, offset, amountToSend);
					offset += amountToSend;
					remainingBytes -= amountToSend;

					if (remainingBytes > 0 && !bufferFull) sendNextPart();
				}

				if (remainingBytes === 0 && !keepAlive) socket.close(); //todo: make timer and add params to keep alive so we can time it out, once keep alive is over x
			};

			socket.ondrain = sendNextPart;
			sendNextPart();
		}
	}]);

	return SocketSender;
})();

module.exports = SocketSender;