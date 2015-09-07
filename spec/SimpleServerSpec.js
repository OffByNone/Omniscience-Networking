require("babel/register");

const Constants = require('../lib/Constants');
const SimpleServer = require("../lib/SimpleServer");

describe("SimpleServer", function () {
	var _sut;
	var _mockHttpServer;
	var _mockUrlProvider;
	var _mockMd5;
	beforeEach(function () {
		_mockHttpServer = { registeredFiles: {}};
		_mockUrlProvider = {};
		_mockMd5 = jasmine.createSpy("mockMd5");
		_sut = new SimpleServer(_mockHttpServer, _mockUrlProvider, _mockMd5);
	});
	describe("registerFile", function () {
		it("should register the file with the server and return the serverPath when the file is local", function () {
			//arrange
			var filePath = "path to my file";
			var filePathHash = "a hash of my file path";
			var fileName = "name of my file";
			var serverIP = "serverIP";
			var serverPort = "serverPort";
			var encodedFilePath = encodeURI(`/${filePathHash}/${fileName}`);
			var file = { path: filePath, name: fileName, isLocal: true };

			_mockMd5.and.returnValue(filePathHash);
			_mockHttpServer.port = serverPort;
			//act
			var actual = _sut.registerFile(file, serverIP);

			//assert
			expect(actual).toBe("http://" + serverIP + ":" + serverPort + encodedFilePath);
			expect(_mockMd5).toHaveBeenCalledWith(filePath);
		});
		it("should register the file with the server and return the serverPath when the filepath is not a valid url", function () {
			//arrange
			var filePath = "path to my file";
			var filePathHash = "a hash of my file path";
			var fileName = "name of my file";
			var serverIP = "serverIP";
			var serverPort = "serverPort";
			var encodedFilePath = encodeURI(`/${filePathHash}/${fileName}`);
			var file = { path: filePath, name: fileName };

			_mockMd5.and.returnValue(filePathHash);
			_mockHttpServer.port = serverPort;
			_mockUrlProvider.isValidUri = jasmine.createSpy("isValidUri").and.returnValue(false);

			//act
			var actual = _sut.registerFile(file, serverIP);

			//assert
			expect(actual).toBe("http://" + serverIP + ":" + serverPort + encodedFilePath);
			expect(_mockMd5).toHaveBeenCalledWith(filePath);
			expect(_mockUrlProvider.isValidUri).toHaveBeenCalledWith(filePath);
		});
		it("should not register the file on the server and just return the file path when the file is not local and its path is a valid uri", function () {
			//arrange
			var filePath = "path to my file";
			var filePathHash = "a hash of my file path";
			var fileName = "name of my file";
			var file = { path: filePath, name: fileName };

			_mockMd5.and.returnValue(filePathHash);
			_mockUrlProvider.isValidUri = jasmine.createSpy("isValidUri").and.returnValue(true);

			//act
			var actual = _sut.registerFile(file);

			//assert
			expect(actual).toBe(filePath);
			expect(_mockMd5).toHaveBeenCalledWith(filePath);
			expect(_mockUrlProvider.isValidUri).toHaveBeenCalledWith(filePath);
		});
	});
});