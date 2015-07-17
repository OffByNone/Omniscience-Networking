require("babel/register");

const Constants = require('../lib/Constants');
const ResponseBuilder = require("../lib/ResponseBuilder");

describe("ResponseBuilder", function () {
	var _sut;
	var _mockFileUtils;
	var _mockNetworkingUtils;
	beforeEach(function () {
		_mockFileUtils = {};
		_mockNetworkingUtils = {};
		_sut = new ResponseBuilder(_mockFileUtils, _mockNetworkingUtils);
	});
	describe("createResponseHeaders", function () {
		it("should return headers in correct format", function () {
			//arrange
			var headers = {};
			var file = "my file";
			var fileLength = 78;
			var contentType = "a valid mime type";

			_mockFileUtils.getMimeType = jasmine.createSpy("mockGetMimeType").and.returnValue(contentType);
			
			//act
			var actual = _sut.createResponseHeaders(headers, file, fileLength);
			
			//assert
			expect(_mockFileUtils.getMimeType).toHaveBeenCalledWith(file);
			var actualHeaders = actual.split(Constants.headerLineDelimiter); //split this back into an array for easier testing.
			
			expect(actualHeaders.length).toBe(5);
			expect(actualHeaders[0]).toBe(Constants.httpVersion + " " + Constants.httpOkStatus.code + " " + Constants.httpOkStatus.reason);
			expect(actualHeaders[1]).toBe("Server: " + Constants.serverName);
			expect(actualHeaders[2]).toBe("Content-Type: " + contentType);
			expect(actualHeaders[3]).toBe("Connection: " + Constants.connectionClose);
			expect(actualHeaders[4]).toBe("Content-Length: " + fileLength);
		});
		it("should set connection to keep-alive when request contains keep-alive", function () {
			//arrange
			var headers = {'connection': 1};
			var file = "my file";
			var fileLength = 78;
			var contentType = "a valid mime type";

			_mockFileUtils.getMimeType = jasmine.createSpy("mockGetMimeType").and.returnValue(contentType);
			
			//act
			var actual = _sut.createResponseHeaders(headers, file, fileLength);
			
			//assert
			var actualHeaders = actual.split(Constants.headerLineDelimiter); //split this back into an array for easier testing.
			
			expect(actualHeaders.length).toBe(5);
			expect(actualHeaders[3]).toBe("Connection: " + Constants.connectionKeepAlive);
		});
		it("should set status to partial when request contains range", function () {
			//arrange
			var headers = {'range':1};
			var file = "my file";
			var fileLength = 78;
			var contentType = "a valid mime type";

			_mockFileUtils.getMimeType = jasmine.createSpy("mockGetMimeType").and.returnValue(contentType);
			
			//act
			var actual = _sut.createResponseHeaders(headers, file, fileLength);
			
			//assert
			var actualHeaders = actual.split(Constants.headerLineDelimiter); //split this back into an array for easier testing.
			
			expect(actualHeaders.length).toBe(5);
			expect(actualHeaders[0]).toBe(Constants.httpVersion + " " + Constants.httpPartialStatus.code + " " + Constants.httpPartialStatus.reason);
		});
	});
	describe("createResponse", function () {
		it('should throw error when there is a body and it is not an array buffer', function () {
			//arrange
			var body = "body";
			var headers = "headers";
			
			_mockNetworkingUtils.isArrayBuffer = jasmine.createSpy("isArrayBuffer").and.returnValue(false);
			
			//act
			try {
				var actual = _sut.createResponse(body, headers);
				fail("should have thrown an error on the above line.");
			}
			catch (e) { 
				expect(e.message).toBe("Body must be a byte array or null.");
			}
		});
		it('should throw error when headers are not a string', function () { 
			//arrange
			var body;
			var headers = {};
			
			_mockNetworkingUtils.isArrayBuffer = jasmine.createSpy("isArrayBuffer").and.returnValue(true);
			
			//act
			try {
				var actual = _sut.createResponse(body, headers);
				fail("should have thrown an error on the above line.");
			}
			catch (e) { 
				expect(e.message).toBe("Headers must be a string");
			}		
		});
		it('should return the headers as a buffer when there is no body', function () {
			//arrange
			var body;
			var headers = "headers";
			var headersByteArray = { buffer: "headers byte array" };
			
			_mockNetworkingUtils.toByteArray = jasmine.createSpy("toByteArray").and.returnValue(headersByteArray);

			//act
			var actual = _sut.createResponse(body,headers);
			
			//assert
			expect(_mockNetworkingUtils.toByteArray).toHaveBeenCalledWith(headers + Constants.headerLineDelimiter + Constants.headerLineDelimiter);
			expect(actual).toBe(headersByteArray.buffer);
		});
		it('should return the headers and body as one buffer when they both exist', function () { 
			//arrange
			var body = new ArrayBuffer(18);
			var headers = "headers";
			var headersByteArray = "headers byte array";
			var smushedBodyAndHead = "both the body and the head, smushed";
			
			_mockNetworkingUtils.isArrayBuffer = jasmine.createSpy("isArrayBuffer").and.returnValue(true);
			_mockNetworkingUtils.toByteArray = jasmine.createSpy("toByteArray").and.returnValue(headersByteArray);
			_mockNetworkingUtils.merge = jasmine.createSpy("merge").and.returnValue(smushedBodyAndHead);

			//act
			var actual = _sut.createResponse(body,headers);
			
			//assert
			expect(_mockNetworkingUtils.merge).toHaveBeenCalledWith(headersByteArray, body);
			expect(actual).toBe(smushedBodyAndHead);			
		});
	});
});