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
			var file = { path: "path_to_my_file" };
			var request = { socket: "request socket" };
			var readBytesResponse = jasmine.createSpyObj("readBytesResponse", ["then"]);


			_mockFileUtils.create = jasmine.createSpy("create").and.returnValue(file);
			_mockFileUtils.readBytes = jasmine.createSpy("readBytes").and.returnValue(readBytesResponse);
			_mockHttpResponder.sendErrorResponse = jasmine.createSpy("sendErrorResponse");
			readBytesResponse.then.and.callFake(function () { Promise.reject(); });

			//act
			_sut.sendResponse(request, filePath);

			//assert
			expect(readBytesResponse.then).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
			readBytesResponse.then.calls.argsFor(0)[1]();


			expect(_mockHttpResponder.sendErrorResponse).toHaveBeenCalledWith(request.socket);
		});
	});
});