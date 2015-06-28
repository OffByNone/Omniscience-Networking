class TCPCommunicator {
	constructor(timers, tcpSocketProvider, socketSender) {
		this.responseTimeout = 5000;
		this._timers = timers;
		this._tcpSocketProvider = tcpSocketProvider;
		this._socketSender = socketSender;
	}
	send(ip, port, data, waitForResponse) {
		return new Promise((resolve, reject) => {
			var socket = this._tcpSocketProvider.createTCPSocket();
			socket.onopen = () => {
				this._socketSender.send(socket, data, waitForResponse);
				this._timers.setTimeout(() => {
					try {
						socket.close();
						reject('Device did not respond within ' + (this.responseTimeout / 1000) + ' seconds.');
					}
					catch (e) {
						//todo: if the error is anything other than the socket is already closed, throw
						//already closed, meaning we already got the response
						//nothing to see here, move along
					}
				}, this.responseTimeout);
			};
			socket.onerror = (err) => reject(err);
			socket.ondata = (dataReceived) => {
				//todo: this will only work when the entire response fits into a single packet, need to loop over this and parse it like in the HttpRequestParser, only different
				socket.close();
				resolve(dataReceived);
			};
			socket.open(ip, port);
		});
	}
}

module.exports = TCPCommunicator;
