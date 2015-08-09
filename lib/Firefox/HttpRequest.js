"use strict";
class HttpRequest {
	constructor() {
		this.headers = [];
		this.parameters = [];
		this.method = "";
		this.body = "";
		this.path = "";
		this.socket = {};
		this.bytes = {
			body: [],
			receivedBody: 0,
			receivedTotal: 0,
			total: 0
		};
	}
}

module.exports = HttpRequest;