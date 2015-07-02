///<reference path="./support/jasmine.d.ts" />

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
		it("should call success callback when it is the first packet in the request and content-length header is missing", function () {
			//arrange
			var request = new HttpRequest();
			var socket = {};
			var eventData = {};
			var success = jasmine.createSpy("success");
			var requestBodyBytes = "in before act";
			request.bytes.body.push(requestBodyBytes);

			var metadata = {
				headers: { "content-length": "ahhhhhh" },
				parameters: "fixed",
				method: "sound",
				path: "clear",
			};
			var body = "body";
			var head = "head";
			var packetBodyBytes = { byteLength: 17 };
			var mergedBody = "it all comes together at last";
			var mergedBodyString = "blah blah blah";

			_mockHttpRequestParser.separateBodyFromHead = jasmine.createSpy("separateBodyFromHead").and.returnValue([head, body]);
			_mockHttpRequestParser.parseMetadata = jasmine.createSpy("parseMetadata").and.returnValue(metadata);
			_mockNetworkingUtils.toByteArray = jasmine.createSpy("toByteArray").and.returnValue(packetBodyBytes);
			_mockNetworkingUtils.merge = jasmine.createSpy("merge").and.returnValue(mergedBody);
			_mockNetworkingUtils.toString = jasmine.createSpy("toString").and.returnValue(mergedBodyString);
					
			//act
			_sut.handleRequest(socket, eventData, request, success, null);
			
			//assert
			expect(_mockHttpRequestParser.separateBodyFromHead).toHaveBeenCalledWith(eventData);
			expect(_mockHttpRequestParser.parseMetadata).toHaveBeenCalledWith(head);
			expect(_mockNetworkingUtils.toByteArray).toHaveBeenCalledWith(body);
			expect(_mockNetworkingUtils.toString).toHaveBeenCalledWith(mergedBody);
			expect(_mockNetworkingUtils.merge).toHaveBeenCalledWith(...request.bytes.body);
			expect(success).toHaveBeenCalledWith(request);

			expect(request.socket).toBe(socket);
			expect(request.headers).toBe(metadata.headers);
			expect(request.parameters).toBe(metadata.parameters);
			expect(request.method).toBe(metadata.method);
			expect(request.path).toBe(metadata.path);
			expect(request.bytes.total).toBeNaN();
			expect(request.bytes.received).toBe(packetBodyBytes.byteLength);
			expect(request.bytes.body.length).toBe(2);
			expect(request.bytes.body[0]).toBe(requestBodyBytes);
			expect(request.bytes.body[1]).toBe(packetBodyBytes);
			expect(request.body).toBe(mergedBodyString);
		});
		it("should call success callback when it has received all the bytes", function () {
			//arrange
			var request = new HttpRequest();
			var socket = {};
			var eventData = { byteLength: 20 };
			var success = jasmine.createSpy("success");
			var requestBodyBytes = "in before act";
			request.bytes.body.push(requestBodyBytes);
			request.bytes.received = 80;
			request.bytes.total = 100;
			request.headers = { "content-length": 100 };
			request.parameters = "fixed";
			request.method = "sound";
			request.path = "clear";


			var mergedBody = "it all comes together at last";
			var mergedBodyString = "blah blah blah";

			_mockNetworkingUtils.merge = jasmine.createSpy("merge").and.returnValue(mergedBody);
			_mockNetworkingUtils.toString = jasmine.createSpy("toString").and.returnValue(mergedBodyString);
					
			//act
			_sut.handleRequest(socket, eventData, request, success, null);
			
			//assert
			expect(success).toHaveBeenCalledWith(request);
			expect(request.bytes.body.length).toBe(2);
			expect(request.bytes.body[1]).toBe(eventData);
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