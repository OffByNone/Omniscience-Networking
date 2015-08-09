"use strict";
const Constants = require('../Constants');

class HttpRequestParser {
	constructor(networkingUtils) {
		this._networkingUtils = networkingUtils;
	}
	parseUrlParams(params) {
		if (!params) return null;

		let parsedParams = {};
		params.split('&').forEach((keyValue) => {
			let [key, value] = decodeURIComponent(keyValue).split('=');
			parsedParams[key] = value;
		});

		return parsedParams;
	}
	separateBodyFromHead(data) {
		if (!data)
			return null;

		let dataStr = this._networkingUtils.toString(data);
		return dataStr.split(Constants.headerLineDelimiter + Constants.headerLineDelimiter);
	}
	parseMetadata(metadata) {
		if (!metadata)
			return null;

		let [requestLine, ...headerLines] = metadata.split(Constants.headerLineDelimiter);
		let [method, uri, protocol] = requestLine.split(Constants.requestLineDelimiter);

		if (protocol !== Constants.httpVersion)
			return null;

		let [path, params] = uri.split('?');
		let parameters = this.parseUrlParams(params);

		let headers = {};
		headerLines.forEach((headerLine) => {
			let [name, value] = headerLine.split(':');
			if (!name || !value)
				return;
			headers[name.toLowerCase().trim()] = value.toLowerCase().trim();
		});

		return { headers, method, parameters, path: path.toLowerCase() };
	}
}

module.exports = HttpRequestParser;