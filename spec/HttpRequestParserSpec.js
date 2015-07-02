///<reference path="./support/jasmine.d.ts" />

require("babel/register");

const Constants = require('../lib/Constants');
const HttpRequestParser = require("../lib/HttpRequestParser");

describe("HttpRequestParser", function () {
	var _sut;
	var _mockNetworkingUtils;
	beforeEach(function () {
		_mockNetworkingUtils = {};
		_sut = new HttpRequestParser(_mockNetworkingUtils);
	});
	describe("parseUrlParams", function () {
		it("should return null when params is null", function () {
			//arrange/act
			var actual = _sut.parseUrlParams(null);
			
			//assert
			expect(actual).toBeNull();
		});
		it("should return an object with decoded key value pairs made from the parameters part of a uri", function () {
			//arrange
			var key1 = "ke!@#$%^&*()-y1";
			var value1 = "val!@#$%^&*()-ue1";
			var key2 = "key2";
			var value2 = "value2";

			var params = encodeURIComponent(key1 + '=' + value1) + '&' + encodeURIComponent(key2 + '=' + value2);

			//act
			var actual = _sut.parseUrlParams(params);
			
			//assert
			expect(typeof actual).toBe("object");
			expect(actual[key1]).toBe(value1);
			expect(actual[key2]).toBe(value2);
		});
	});
	describe("separateBodyFromHead", function () {
		it("should return null when data is null", function () { 
			//arrange/act
			var actual = _sut.separateBodyFromHead(null);
			
			//assert
			expect(actual).toBeNull();
		});
		it("should return a string array with the first element the head and second the body", function () { 
			//arrange
			var head = "my head";
			var body = "my body";
			var data = [head, body].join(Constants.headerLineDelimiter + Constants.headerLineDelimiter);

			_mockNetworkingUtils.toString = jasmine.createSpy("toString").and.returnValue(data);			
			//act
			var actual = _sut.separateBodyFromHead(data);
			
			//assert
			expect(Array.isArray(actual)).toBeTruthy();
			expect(actual[0]).toBe(head);
			expect(actual[1]).toBe(body);
		});
	});
	describe("parseMetadata", function () {
		it("should return null when metadata is null", function () { 
			//arrange/act
			var actual = _sut.parseMetadata(null);
			
			//assert
			expect(actual).toBeNull();
		});
		it("should return null when httpVersion is not handled by the server", function () { 
			//arrange
			var method = "method";
			var uri = "uri";
			var protocol = "notsupported";
			var requestLine = [method, uri, protocol].join(Constants.requestLineDelimiter);
			var headerLines = "headerLines";
			var metadata = [requestLine, headerLines].join(Constants.headerLineDelimiter);

			//act
			var actual = _sut.parseMetadata(metadata);
			
			//assert
			expect(actual).toBeNull();
		});
		it("should return metadata split apart into an object containing: headers, method, parameters, and path", function () { 
			//arrange
			var method = "method";
			var path = "LETSTESTthelowercasing";
			var params = "notyourparams";
			var uri = [path, params].join("?");
			var parsedUrlParams = "Yourparams";
			var protocol = Constants.httpVersion;
			var requestLine = [method, uri, protocol].join(Constants.requestLineDelimiter);
			var headerLine1Part1 = "TEST LOWER CASE";
			var headerLine1Part2 = "BOTH OF THESE SHOULD BE LOWER";
			var headerLine1 = [headerLine1Part1, headerLine1Part2].join(":");
			var headerLine2Part1 = "be sure this works";
			var headerLine2Part2 = "of course it does";			
			var headerLine2 = [headerLine2Part1, headerLine2Part2].join(":");
			var headerLine3Part1 = "this should not be on the object";
			var headerLine3 = headerLine3Part1 + ":";
			var headerLines = [headerLine1, headerLine2, headerLine3].join(Constants.headerLineDelimiter);
			var metadata = [requestLine, headerLines].join(Constants.headerLineDelimiter);

			spyOn(_sut, "parseUrlParams").and.returnValue(parsedUrlParams);

			//act
			var actual = _sut.parseMetadata(metadata);
			
			//assert
			expect(typeof actual).toBe("object");
			expect(_sut.parseUrlParams).toHaveBeenCalledWith(params);
			expect(actual.parameters).toBe(parsedUrlParams);
			expect(actual.path).toBe(path.toLowerCase());
			expect(actual.method).toBe(method);
			expect(typeof actual.headers).toBe("object");
			expect(actual.headers[headerLine1Part1.toLowerCase()]).toBe(headerLine1Part2.toLowerCase());
			expect(actual.headers[headerLine2Part1]).toBe(headerLine2Part2);
			expect(actual.headers[headerLine3Part1]).toBeUndefined();
		});
	});
});