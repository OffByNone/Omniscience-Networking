const Constants = require('./Constants');

class SocketSender {
	constructor() { }

	send(socket, message, keepAlive) {
		socket.ondrain = this._sendNextPart;
		this._sendNextPart(socket, 0, message.length, message, keepAlive);
	}

	_sendNextPart(socket, offset, remaining, response, keepAlive) {
		var amountToSend = Math.min(remaining, Constants.socketBufferSize);
		var bufferFull = socket.send(response, offset, amountToSend);

		offset += amountToSend;
		remaining -= amountToSend;

		if (remaining > 0) {
			if (!bufferFull)
				this._sendNextPart(socket, offset, remaining, response, keepAlive);
		}
		else if (!keepAlive) {
			socket.close(); //todo: make timer and add params to keep alive so we can time it out, once keep alive is over
		}
	}
}

module.exports = SocketSender;