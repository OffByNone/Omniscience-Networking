module.exports = {
	headerLineDelimiter: '\r\n',
	requestLineDelimiter: ' ',
	httpOkStatus: {
		code: 200,
		reason: 'OK'
	},
	httpFileNotFoundStatus: {
		code: 404,
		reason: 'File Not Found'
	},
	httpTimeoutStatus: {
		code: 500,
		reason: 'Server Timed out while attempting to respond.'
	},
	httpErrorStatus: {
		code: 500,
		reason: 'Server has encountered an error.'
	},
	httpPartialStatus: {
		code: 206,
		reason: 'Partial Content'
	},
	httpVersion : 'HTTP/1.1',
	serverName : 'omniscience-server-0.2.0',
	serverTimeoutInMilliseconds: 5000,
	socketBufferSize: 64 * 1024
};