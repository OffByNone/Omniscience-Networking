///<reference path="./support/jasmine.d.ts" />

require("babel/register");

const Constants = require('../lib/Constants');
const HttpResponder = require("../lib/HttpResponder");

describe("HttpResponder", function () {
	var _sut;
	var _mockNetworkingUtils;
	var _mockSocketSender;
	beforeEach(function () {
		_mockNetworkingUtils = {};
		_mockSocketSender = {};
		_sut = new HttpResponder(_mockNetworkingUtils, _mockSocketSender);
	});
	describe("sendOkResponse", function () {
		it("should send 200 response", function () { 
			//arrange
			var socket = "socket";
			spyOn(_sut, '_sendResponse');
			
			//act
			_sut.sendOkResponse(socket);
			
			//assert
			expect(_sut._sendResponse).toHaveBeenCalledWith(socket, Constants.httpOkStatus);
		});
	});
	describe("sendFileNotFoundResponse", function () {
		it("should send 404 response", function () { 
			//arrange
			var socket = "socket";
			spyOn(_sut, '_sendResponse');
			
			//act
			_sut.sendFileNotFoundResponse(socket);
			
			//assert
			expect(_sut._sendResponse).toHaveBeenCalledWith(socket, Constants.httpFileNotFoundStatus);
		});
	});
	describe("sendTimeoutResponse", function () {
		it("should send 500 response", function () { 
			//arrange
			var socket = "socket";
			spyOn(_sut, '_sendResponse');
			
			//act
			_sut.sendTimeoutResponse(socket);
			
			//assert
			expect(_sut._sendResponse).toHaveBeenCalledWith(socket, Constants.httpTimeoutStatus);
		});
	});
	describe("sendErrorResponse", function () {
		it("should send 500 response", function () { 
			//arrange
			var socket = "socket";
			spyOn(_sut, '_sendResponse');
			
			//act
			_sut.sendErrorResponse(socket);
			
			//assert
			expect(_sut._sendResponse).toHaveBeenCalledWith(socket, Constants.httpErrorStatus);
		});
	});
	describe("_sendResponse", function () {
		it("should send socket and status code to the socket sender", function () { 
			//arrange
			var socket = "my socket";
			var httpStatus = { code: "code", reason: "reason" };
			var byteArray = { buffer: "buffer" };

			var headers = [
				`${Constants.httpVersion} ${httpStatus.code} ${httpStatus.reason}`,
				`Server: ${Constants.serverName }`,
				`Content-Type: text\\plain`,
				`Connection: close`,
				`Content-Length: 0`
			];

			_mockSocketSender.send = jasmine.createSpy("send");
			_mockNetworkingUtils.toByteArray = jasmine.createSpy("toByteArray").and.returnValue(byteArray);
			
			//act
			_sut._sendResponse(socket, httpStatus);
			
			//assert
			expect(_mockNetworkingUtils.toByteArray).toHaveBeenCalledWith(headers.join(Constants.headerLineDelimiter));
			expect(_mockSocketSender.send).toHaveBeenCalledWith(socket, byteArray.buffer, false);
		});
	});
});