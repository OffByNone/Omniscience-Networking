"use strict";
class TCPSocketProvider {
	constructor(tcpSocketCreator) { this._tcpSocketCreator = tcpSocketCreator; }
	createTCPSocket() { return this._tcpSocketCreator(); }
}

module.exports = TCPSocketProvider;