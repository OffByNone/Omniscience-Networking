
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
			received: 0,
			total: 0
		};
	}
}

module.exports = HttpRequest;
