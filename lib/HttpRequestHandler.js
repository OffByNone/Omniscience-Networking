const Constants = require('./Constants');
const HttpRequest = require('./HttpRequest');

class HttpRequestHandler {
	constructor(networkingUtils, httpRequestParser) {
		this._networkingUtils = networkingUtils;
		this._httpRequestParser = httpRequestParser;
	}
	handleRequest(socket, eventData, request, success, failure) {
		var packetBodyBytes;

		if (request.bytes.received === 0) {
			request.socket = socket;

			var [head, body] = this._httpRequestParser.separateBodyFromHead(eventData);
			var metadata = this._httpRequestParser.parseMetadata(head);
			if (!metadata) {
				failure(request, "metadata not parsable.");
				return;
			}
			
			packetBodyBytes = this._networkingUtils.toByteArray(body);

			request.headers = metadata.headers;
			request.parameters = metadata.parameters;
			request.method = metadata.method;
			request.path = metadata.path;
			request.bytes.total = parseInt(request.headers['content-length'], 10);
		}
		else
			packetBodyBytes = eventData;

		request.bytes.received += packetBodyBytes.byteLength;
		request.bytes.body.push(packetBodyBytes);

		if (isNaN(request.bytes.total) || request.bytes.received >= request.bytes.total) {
			var mergedBody = this._networkingUtils.merge(...request.bytes.body);
			request.body = this._networkingUtils.toString(mergedBody);
			success(request);
		}
	}
	
}

module.exports = HttpRequestHandler;