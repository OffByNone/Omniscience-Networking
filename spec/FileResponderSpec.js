require("babel/register");

const Constants = require('../lib/Constants');
const FileResponder = require("../lib/FileResponder");

describe("FileResponder", function () {
	var _sut;
	var _mockFileUtils;
	var _mockHttpResponder;
	var _mockNetworkingUtils;
	var _mockSocketSender;
	var _mockResponseBuilder;
	beforeEach(function () {
		_mockFileUtils = {};
		_mockHttpResponder = {};
		_mockNetworkingUtils = {};
		_mockResponseBuilder = {};
		_mockSocketSender = {};
		_sut = new FileResponder(_mockFileUtils, _mockHttpResponder, _mockNetworkingUtils, _mockSocketSender, _mockResponseBuilder);
	});
	describe("sendResponse", function () {
		it("should send error response when there is an error", function () {
			//arrange
			var filePath = "path to file";
			var request = { socket: "request socket" };

			_mockHttpResponder.sendErrorResponse = jasmine.createSpy("sendErrorResponse");
			_mockFileUtils.create = function () { throw new Error(); };
			
			//act
			_sut.sendResponse(request, filePath);
			
			//assert
			expect(_mockHttpResponder.sendErrorResponse).toHaveBeenCalledWith(request.socket);
		});
		it("should send file response when there are no errors", function () {
			//arrange
			var filePath = "path to file";
			var file = { path: "path_to_my_file" };
			var request = { socket: "request socket", headers: { range: "somerange" }, method: "NOT HEAD" };
			var readBytesResponse = jasmine.createSpyObj("readBytesResponse", ["then"]);

			_mockFileUtils.create = jasmine.createSpy("create").and.returnValue(file);
			_mockFileUtils.readBytes = jasmine.createSpy("readBytes").and.returnValue(readBytesResponse);
			
			//act
			_sut.sendResponse(request, filePath);
			
			//assert
			expect(_mockFileUtils.create).toHaveBeenCalledWith(filePath);
			expect(_mockFileUtils.readBytes).toHaveBeenCalledWith(file.path);
			expect(readBytesResponse.then).toHaveBeenCalledWith(jasmine.any(Function));

			//second arrange
			var fileBytes = "17";
			var offset = 37;
			var fileResponseBytes = { byteLength: "the bytes to respond with" };
			var responseHeaders = "some headers for the response";
			var response = "the response";

			_mockNetworkingUtils.parseRange = jasmine.createSpy("parseRange").and.returnValue(offset);
			_mockNetworkingUtils.offsetBytes = jasmine.createSpy("offsetBytes").and.returnValue(fileResponseBytes);
			_mockResponseBuilder.createResponseHeaders = jasmine.createSpy("createResponseHeaders").and.returnValue(responseHeaders);
			_mockResponseBuilder.createResponse = jasmine.createSpy("createResponse").and.returnValue(response);
			_mockSocketSender.send = jasmine.createSpy("send");

			//second act
			readBytesResponse.then.calls.argsFor(0)[0](fileBytes);

			//second assert
			expect(_mockNetworkingUtils.parseRange).toHaveBeenCalledWith(request.headers.range);
			expect(_mockNetworkingUtils.offsetBytes).toHaveBeenCalledWith(offset, fileBytes);
			expect(_mockResponseBuilder.createResponseHeaders).toHaveBeenCalledWith(request.headers, file, fileResponseBytes.byteLength);
			expect(_mockResponseBuilder.createResponse).toHaveBeenCalledWith(fileResponseBytes, responseHeaders);
			expect(_mockSocketSender.send).toHaveBeenCalledWith(request.socket, response, false);
		});
		it("should send response with null file when method is head, and send keepalive true when request has keep alive true", function () {
			//arrange
			var filePath = "path to file";
			var file = { path: "path_to_my_file" };
			var request = { socket: "request socket", headers: { range: "somerange", connection: "keep-alive" }, method: "HEAD" };
			var readBytesResponse = jasmine.createSpyObj("readBytesResponse", ["then"]);

			_mockFileUtils.create = jasmine.createSpy("create").and.returnValue(file);
			_mockFileUtils.readBytes = jasmine.createSpy("readBytes").and.returnValue(readBytesResponse);
			
			//act
			_sut.sendResponse(request, filePath);
			
			//assert
			expect(_mockFileUtils.create).toHaveBeenCalledWith(filePath);
			expect(_mockFileUtils.readBytes).toHaveBeenCalledWith(file.path);
			expect(readBytesResponse.then).toHaveBeenCalledWith(jasmine.any(Function));

			//second arrange
			var fileBytes = "17";
			var offset = 37;
			var fileResponseBytes = { byteLength: "the bytes to respond with" };
			var responseHeaders = "some headers for the response";
			var response = "the response";

			_mockNetworkingUtils.parseRange = jasmine.createSpy("parseRange").and.returnValue(offset);
			_mockNetworkingUtils.offsetBytes = jasmine.createSpy("offsetBytes").and.returnValue(fileResponseBytes);
			_mockResponseBuilder.createResponseHeaders = jasmine.createSpy("createResponseHeaders").and.returnValue(responseHeaders);
			_mockResponseBuilder.createResponse = jasmine.createSpy("createResponse").and.returnValue(response);
			_mockSocketSender.send = jasmine.createSpy("send");

			//second act
			readBytesResponse.then.calls.argsFor(0)[0](fileBytes);

			//second assert
			expect(_mockNetworkingUtils.parseRange).toHaveBeenCalledWith(request.headers.range);
			expect(_mockNetworkingUtils.offsetBytes).toHaveBeenCalledWith(offset, fileBytes);
			expect(_mockResponseBuilder.createResponseHeaders).toHaveBeenCalledWith(request.headers, file, fileResponseBytes.byteLength);
			expect(_mockResponseBuilder.createResponse).toHaveBeenCalledWith(null, responseHeaders);
			expect(_mockSocketSender.send).toHaveBeenCalledWith(request.socket, response, true);
		});		
	});
});