require("babel/register");

const Constants = require('../lib/Constants');
const HttpServer = require("../lib/Chrome/HttpServer");
const HttpRequest = require("../lib/HttpRequest");

describe("ChromeHttpServer", function () {
	var _sut;
	var _mockTCPSocket;
	var _mockUrlProvider;
	var _mockHttpResponder;
	var _mockRequestHandler;
	var _mockTimer;
	var _mockFileResponder;
	beforeEach(function () {
		_mockFileResponder = {};
		_mockHttpResponder = {};
		_mockRequestHandler = {};
		_mockTCPSocket = {};
		_mockTimer = {};
		_mockUrlProvider = {};
		_sut = new HttpServer(_mockTCPSocket, _mockUrlProvider, _mockHttpResponder, _mockRequestHandler, _mockTimer, _mockFileResponder);
	});
	describe("start", function () {
		it("should do nothing when server is already running", function () { 
			//arrange
			_sut.isRunning = true;
			
			//act/assert
			_sut.start();
		});
		it("should start the server, and set isRunning to true when the server is not already running", function () { 
			//arrange
			var randomPort = "some random value";
			var tcpSocket = {};
			var incomingSocket = {};
			var event = { data: "data for the event" };

			spyOn(_sut, "_getRandomPort").and.returnValue(randomPort);
			_mockTCPSocket.listen = jasmine.createSpy("listen").and.returnValue(tcpSocket);
			_mockRequestHandler.handleRequest = jasmine.createSpy("handleRequest");
			spyOn(_sut, "_onRequestSuccess");
			spyOn(_sut, "_onRequestError");
						
			//act
			_sut.start();
			
			//assert
			expect(_sut._getRandomPort).toHaveBeenCalledWith();
			expect(_mockTCPSocket.listen).toHaveBeenCalledWith(randomPort, { binaryType: "arraybuffer" });
			expect(typeof tcpSocket.onconnect).toBe("function");

			tcpSocket.onconnect(incomingSocket);
			expect(typeof incomingSocket.ondata).toBe("function");
			incomingSocket.ondata(event);

			var request = "request";
			var error = "error";
			expect(_mockRequestHandler.handleRequest).toHaveBeenCalledWith(incomingSocket, event.data, jasmine.any(HttpRequest), jasmine.any(Function), jasmine.any(Function));
			_mockRequestHandler.handleRequest.calls.argsFor(0)[3](request);
			_mockRequestHandler.handleRequest.calls.argsFor(0)[4](request, error);
			expect(_sut._onRequestSuccess).toHaveBeenCalledWith(request);
			expect(_sut._onRequestError).toHaveBeenCalledWith(request, error);

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
	describe("_onRequestSuccess", function () {
		it("should send timeout response when timeout period has expired and socket is still open", function () { 
			//arrange
			var request = { path: "request path", socket: { readyState: "open" } };

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockHttpResponder.sendTimeoutResponse = jasmine.createSpy("sendTimeoutResponse");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");
			
			//act
			_sut._onRequestSuccess(request);
			
			//assert
			expect(_mockTimer.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), Constants.serverTimeoutInMilliseconds);
			_mockTimer.setTimeout.calls.argsFor(0)[0]();
			expect(_mockHttpResponder.sendTimeoutResponse).toHaveBeenCalledWith(request.socket);
		});
		it("should not send timeout response when timeout period has expired and socket is not open", function () { 
			//arrange
			var request = { path: "request path", socket: { readyState: "closed" } };

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");
			
			//act
			_sut._onRequestSuccess(request);
			
			//assert
			_mockTimer.setTimeout.calls.argsFor(0)[0]();
		});
		it("should clear timeout when socket is closed", function () { 
			//arrange
			var request = { path: "request path", socket: { readyState: "closed" } };
			var timeoutId = "7";

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout").and.returnValue(timeoutId);
			_mockTimer.clearTimeout = jasmine.createSpy("clearTimeout");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");
			
			//act
			_sut._onRequestSuccess(request);
			
			//assert
			expect(typeof request.socket.onclose).toBe("function");
			request.socket.onclose();
			expect(_mockTimer.clearTimeout).toHaveBeenCalledWith(timeoutId);
		});
		it("should execute callback when requestPath matches a callback path", function () { 
			//arrange
			var request = { path: "request_path", socket: { readyState: "closed" } };

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_sut._registeredPaths[request.path] = jasmine.createSpy("registeredPath");

			//act
			_sut._onRequestSuccess(request);
			
			//assert
			expect(_sut._registeredPaths[request.path]).toHaveBeenCalledWith(request);

		});
		it("should respond with the mapped file when requestPath matches a mapped file", function () { 
			//arrange
			var request = { path: "request_path", socket: { readyState: "closed" } };
			var registeredFile = "registeredFile";

			_sut._registeredFiles[request.path] = registeredFile;

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockFileResponder.sendResponse = jasmine.createSpy("sendResponse");

			//act
			_sut._onRequestSuccess(request);
			
			//assert
			expect(_mockFileResponder.sendResponse).toHaveBeenCalledWith(request, registeredFile);
		});
		it("should respond with file not found when neither a callback nor file matches the requestPath", function () { 
			//arrange
			var request = { path: "request_path", socket: { readyState: "closed" } };

			_mockTimer.setTimeout = jasmine.createSpy("setTimeout");
			_mockHttpResponder.sendFileNotFoundResponse = jasmine.createSpy("sendFileNotFoundResponse");

			//act
			_sut._onRequestSuccess(request);
			
			//assert
			expect(_mockHttpResponder.sendFileNotFoundResponse).toHaveBeenCalledWith(request.socket);
		});
	});
	describe("_onRequestError", function () {
		it("should respond with error when the socket is still open", function () {
			//arrange
			var request = { socket: { readyState: "open" } };
			var error = "error";
			_mockHttpResponder.sendErrorResponse = jasmine.createSpy("sendErrorResponse");
			
			//act
			_sut._onRequestError(request, error);
			
			//assert
			expect(_mockHttpResponder.sendErrorResponse).toHaveBeenCalledWith(request.socket);
		});

		it("should do nothing when socket is not open", function () {
			//arrange
			var request = { socket: { readyState: "closed" } };
			var error = "error";
			
			//act/assert
			_sut._onRequestError(request, error);
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
			var url = { pathname: "name_of_the_path" };

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
			var url = { pathname: "name_of_the_path" };

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
			var url = { pathname: "name_of_the_path" };

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
			var url = { pathname: "name_of_the_path" };

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