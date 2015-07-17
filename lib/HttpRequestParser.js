const Constants = require('./Constants');
const HttpRequest = require('./HttpRequest');

class HttpRequestParser {
	constructor(networkingUtils) {
		this._networkingUtils = networkingUtils;
	}
	parseUrlParams(params) {
		if (!params) return null;

		var parsedParams = {};
		params.split('&').forEach((keyValue) => {
			var [key, value] = decodeURIComponent(keyValue).split('=');
			parsedParams[key] = value;
		});

		return parsedParams;
	}
	separateBodyFromHead(data) {
		if (!data)
			return null;

		var dataStr = this._networkingUtils.toString(data);
		return dataStr.split(Constants.headerLineDelimiter + Constants.headerLineDelimiter);
	}
	parseMetadata(metadata) {
		if (!metadata)
			return null;

		var [requestLine, ...headerLines] = metadata.split(Constants.headerLineDelimiter);
		var [method, uri, protocol] = requestLine.split(Constants.requestLineDelimiter);

		if (protocol !== Constants.httpVersion)
			return null;

		var [path, params] = uri.split('?');
		var parameters = this.parseUrlParams(params);

		var headers = {};
		headerLines.forEach((headerLine) => {
			var [name, value] = headerLine.split(':');
			if (!name || !value)
				return;
			headers[name.toLowerCase().trim()] = value.toLowerCase().trim();
		});

		return { headers, method, parameters, path: path.toLowerCase() };
	}
}

module.exports = HttpRequestParser;