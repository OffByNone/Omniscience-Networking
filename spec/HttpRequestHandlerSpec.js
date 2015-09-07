require("babel/register");

const Constants = require('../lib/Constants');
const HttpRequest = require('../lib/HttpRequest');
const HttpRequestHandler = require("../lib/HttpRequestHandler");

describe("HttpRequestHandler", function () {
	var _sut;
	var _mockNetworkingUtils;
	var _mockHttpRequestParser;
	beforeEach(function () {
		_mockNetworkingUtils = {};
		_mockHttpRequestParser = {};
		_sut = new HttpRequestHandler(_mockNetworkingUtils, _mockHttpRequestParser);
	});
	describe("handleRequest", function () {
		it("should call failure callback when it is the first packet in the request and the metadata is not parsable", function () {
			//arrange
			var request = new HttpRequest();
			var socket = {};
			var eventData = {};
			var failure = jasmine.createSpy("failure");

			var body = "body";
			var head = "head";

			_mockHttpRequestParser.separateBodyFromHead = jasmine.createSpy("separateBodyFromHead").and.returnValue([head, body]);
			_mockHttpRequestParser.parseMetadata = jasmine.createSpy("parseMetadata").and.returnValue(null);

			//act
			_sut.handleRequest(socket, eventData, request, null, failure);

			//assert
			expect(_mockHttpRequestParser.separateBodyFromHead).toHaveBeenCalledWith(eventData);
			expect(_mockHttpRequestParser.parseMetadata).toHaveBeenCalledWith(head);
			expect(failure).toHaveBeenCalledWith(request, "metadata not parsable.");
			expect(request.socket).toBe(socket);
		});
		it("should not parse header when it is not the first packet", function () {
			//arrange
			var request = {
				bytes: {
					body: [],
					received: 80,
					total: 150
				}
			};
			var eventData = { byteLength: 20 };

			//act
			_sut.handleRequest(null, eventData, request, null, null);

			//assert
			expect(request.bytes.body.length).toBe(1);
			expect(request.bytes.body[0]).toBe(eventData);
		});
		it("should not call any callbacks when there is no error, and we do not have all the content yet", function () {
			//arrange
			var request = {
				bytes: {
					body: [],
					received: 80,
					total: 150
				}
			};
			var eventData = { byteLength: 20 };

			//act
			_sut.handleRequest(null, eventData, request, null, null);

			//assert
		});
	});
});