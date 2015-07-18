"use strict";

class HttpRequestHandler {
	constructor(networkingUtils, httpRequestParser) {
		this._networkingUtils = networkingUtils;
		this._httpRequestParser = httpRequestParser;
	}
	handleRequest(socket, eventData, request, success, failure) {
		let packetBodyBytes;

		if (request.bytes.receivedTotal === 0) {
			request.socket = socket;

			let [head, body] = this._httpRequestParser.separateBodyFromHead(eventData);
			let metadata = this._httpRequestParser.parseMetadata(head);
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

		request.bytes.receivedTotal += eventData.byteLength;
		request.bytes.receivedBody += packetBodyBytes.byteLength;
		request.bytes.body.push(packetBodyBytes);

		if (isNaN(request.bytes.total) || request.bytes.receivedTotal >= request.bytes.total) {
			let mergedBody = this._networkingUtils.merge(...request.bytes.body);
			request.body = this._networkingUtils.toString(mergedBody);
			success(request);
		}
	}

}

module.exports = HttpRequestHandler;