///<reference path="./support/jasmine.d.ts" />

require("babel/register");

const Constants = require('../lib/Constants');
const HttpServer = require("../lib/HttpServer");

describe("HttpServer", function () {
	var _sut;
	var _mockTCPSocket;
	var _mockUrlProvider;
	var _mockHttpResponder;
	var _mockRequestParser;
	var _mockTimer;
	var _mockFileResponder;
	beforeEach(function () {
		_mockFileResponder = {};
		_mockHttpResponder = {};
		_mockRequestParser = {};
		_mockTCPSocket = {};
		_mockTimer = {};
		_mockUrlProvider = {};
		_sut = new HttpServer(_mockTCPSocket, _mockUrlProvider, _mockHttpResponder, _mockRequestParser, _mockTimer, _mockFileResponder);
	});
	describe("start", function () {
		it("should do nothing when server is already running", function () { 
			//arrange
			_sut.isRunning = true;
			
			//act/assert
			_sut.start();
		});
		it("should do nothing when server is already running", function () { 
			//arrange
			var randomPort = "some random value";
			var tcpSocket = {};
			var incomingSocket = "incomingSocket";
			
			spyOn(_sut, "_getRandomPort").and.returnValue(randomPort);
			_mockTCPSocket.listen = jasmine.createSpy("listen").and.returnValue(tcpSocket);
			_mockRequestParser.parseRequest = jasmine.createSpy("parseRequest");
			spyOn(_sut, "_handleRequest");
			spyOn(_sut, "_handleError");
						
			//act
			_sut.start();
			
			//assert
			expect(_sut._getRandomPort).toHaveBeenCalledWith();
			expect(_mockTCPSocket.listen).toHaveBeenCalledWith(randomPort, { binaryType: "arraybuffer" });
			expect(typeof tcpSocket.onconnect).toBe("function");
			
			tcpSocket.onconnect(incomingSocket);
			
			var request = "request";
			var error = "error";			
			expect(_mockRequestParser.parseRequest).toHaveBeenCalledWith(incomingSocket, jasmine.any(Function), jasmine.any(Function));
			_mockRequestParser.parseRequest.calls.argsFor(0)[1](request);
			_mockRequestParser.parseRequest.calls.argsFor(0)[2](error);
			expect(_sut._handleRequest).toHaveBeenCalledWith(incomingSocket, request);
			expect(_sut._handleError).toHaveBeenCalledWith(incomingSocket, error);
			
			expect(_sut.isRunning).toBeTruthy();
		});		
	});
	describe("stop", function () { 
		it("should do nothing when server is not running", function () {
			//arrange
			_sut.isRunning = false;
			
			//act/assert
			_sut.stop();
		});
		it("should stop server when running and set server as not running", function () { 
			//arrange
			_sut.isRunning = true;
			_sut.socket = jasmine.createSpyObj("socket", ["close"]);
			
			//act
			_sut.stop();
			
			//assert
			expect(_sut.socket.close).toHaveBeenCalledWith();
			expect(_sut.isRunning).toBeFalsy();			
		});
	});
	describe("_handleRequest", function () { 
		it("should send timeout response when timeout period has expired and socket is still open", function () { 
			//arrange
			var incomingSocket = {readyState: "open"};
			var request = { path: "request path" };
			
			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockHttpResponder.sendTimeoutResponse = jasmine.createSpy("sendTimeoutResponse");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");
			
			//act
			_sut._handleRequest(incomingSocket, request);
			
			//assert
			expect(_mockTimer.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), Constants.serverTimeoutInMilliseconds);
			_mockTimer.setTimeout.calls.argsFor(0)[0]();
			expect(_mockHttpResponder.sendTimeoutResponse).toHaveBeenCalledWith(incomingSocket);		
		});
		it("should send timeout response when timeout period has expired", function () { 
			//arrange
			var incomingSocket = {readyState: "closed"};
			var request = { path: "request path" };
			
			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");
			
			//act
			_sut._handleRequest(incomingSocket, request);
			
			//assert
			_mockTimer.setTimeout.calls.argsFor(0)[0]();
		});		
		it("should execute callback when requestPath matches a callback path", function () { 
			//arrange
			var incomingSocket = {readyState: "open"};
			var request = { path: "request_path" };
			
			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_sut._registeredPaths[request.path] = jasmine.createSpy("registeredPath");

			//act
			_sut._handleRequest(incomingSocket, request);
			
			//assert
			expect(_sut._registeredPaths[request.path]).toHaveBeenCalledWith(request);			
			
		});
		it("should respond with the mapped file when requestPath matches a mapped file", function () { 
			//arrange
			var incomingSocket = {readyState: "open"};
			var request = { path: "request_path" };
			var registeredFile = "registeredFile";

			_sut._registeredFiles[request.path] = registeredFile;

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockFileResponder.sendResponse = jasmine.createSpy("sendResponse");

			//act
			_sut._handleRequest(incomingSocket, request);
			
			//assert
			expect(_mockFileResponder.sendResponse).toHaveBeenCalledWith(request, registeredFile);			
		});	
		it("should respond with file not found when neither a callback nor file matches the requestPath", function () { 
			//arrange
			var incomingSocket = {readyState: "open"};
			var request = { path: "request_path" };

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");

			//act
			_sut._handleRequest(incomingSocket, request);
			
			//assert
			expect(_mockHttpResponder.sendFileNotFoundResponse).toHaveBeenCalledWith(incomingSocket);				
		});
	});	
	describe("_handleError", function () { 
		it("should respond with error when the socket is still open", function () {
			//arrange
			var incomingSocket = { readyState: "open" };
			var error = "error";
			_mockHttpResponder.sendErrorResponse = jasmine.createSpy("sendErrorResponse");
			
			//act
			_sut._handleError(incomingSocket, error);
			
			//assert
			expect(_mockHttpResponder.sendErrorResponse).toHaveBeenCalledWith(incomingSocket);
		});
		
		it("should do nothing when socket is not open", function () {
			//arrange
			var incomingSocket = { readyState: "closed" };
			var error = "error";
			
			//act/assert
			_sut._handleError(incomingSocket, error);
		});
	});
	describe("_getRandomPort", function () { 
		it("should return a random port each time it is called", function () { 
			//arrange/act
			var port1 = _sut._getRandomPort();
			var port2 = _sut._getRandomPort();
			var port3 = _sut._getRandomPort();
			
			//assert
			expect(port1).not.toBe(port2);
			expect(port1).not.toBe(port3);
			expect(port2).not.toBe(port3);
		});
	});
	describe("registerFile", function () { 
		it("should register file when filePath is not null and return path on server", function () { 
			//arrange
			var filepath = "path to a file";
			var serverPath = "path to access file on server";
			var url = {pathname: "name_of_the_path"};
			
			_mockUrlProvider.createUrl = jasmine.createSpy("createUrl").and.returnValue(url);
			
			//act
			var actual = _sut.registerFile(serverPath, filepath);
			
			//assert
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(serverPath.toLowerCase(), "http://localhost/");
			expect(actual).toBe(url.pathname);
			expect(_sut._registeredFiles[url.pathname]).toBe(filepath);
		});
		it("should unregister file when filePath is null and return path on server", function () { 
			//arrange
			var serverPath = "path to access file on server";
			var url = {pathname: "name_of_the_path"};
			
			_mockUrlProvider.createUrl = jasmine.createSpy("createUrl").and.returnValue(url);
			
			//act
			var actual = _sut.registerFile(serverPath);
			
			//assert
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(serverPath.toLowerCase(), "http://localhost/");
			expect(actual).toBe(url.pathname);
			expect(_sut._registeredFiles[url.pathname]).toBeUndefined();			
		});
		
	});
	describe("registerPath", function () { 
		it("should register callback when callback is not null and return path on server", function () {
			//arrange
			var callback = function () { };
			var serverPath = "path to access file on server";
			var url = {pathname: "name_of_the_path"};
			
			_mockUrlProvider.createUrl = jasmine.createSpy("createUrl").and.returnValue(url);
			
			//act
			var actual = _sut.registerFile(serverPath, callback);
			
			//assert
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(serverPath.toLowerCase(), "http://localhost/");
			expect(actual).toBe(url.pathname);
			expect(_sut._registeredFiles[url.pathname]).toBe(callback);
		 });
		it("should unregister callback when callback is null and return path on server", function () { 
			//arrange
			var serverPath = "path to access file on server";
			var url = {pathname: "name_of_the_path"};
			
			_mockUrlProvider.createUrl = jasmine.createSpy("createUrl").and.returnValue(url);
			
			//act
			var actual = _sut.registerFile(serverPath);
			
			//assert
			expect(_mockUrlProvider.createUrl).toHaveBeenCalledWith(serverPath.toLowerCase(), "http://localhost/");
			expect(actual).toBe(url.pathname);
			expect(_sut._registeredFiles[url.pathname]).toBeUndefined();			
		});		
	});
});