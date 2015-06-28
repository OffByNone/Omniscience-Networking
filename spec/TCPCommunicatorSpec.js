///<reference path="./support/jasmine.d.ts" />

require("babel/register");

const Constants = require('../lib/Constants');
const TCPCommunicator = require("../lib/TCPCommunicator");

describe("TCPCommunicator", function () {
	var _sut;
	var _mockTimers;
	var _mockTCPSocketProvider;
	var _mockSocketSender;
	beforeEach(function () {
		_mockTimers = {};
		_mockTCPSocketProvider = {};
		_mockSocketSender = {};
		_sut = new TCPCommunicator(_mockTimers, _mockTCPSocketProvider, _mockSocketSender);
	});
	describe("send", function () {
		it("should create a socket, map the correct functions then open the socket", function () {
			//arrange
			var ip = "ip";
			var port = "port";
			var data = "data";
			var waitForResponse = "waitForResponse";
			var tcpSocket = { open: jasmine.createSpy("open") };
			var dataReceived = "data received";

			_mockTCPSocketProvider.createTCPSocket = jasmine.createSpy("createTCPSocket").and.returnValue(tcpSocket);
			spyOn(_sut, '_onopen');
			spyOn(_sut, '_ondata');
			
			//act
			_sut.send(ip, port, data, waitForResponse);
			
			//assert
			expect(typeof tcpSocket.onopen).toBe("function");
			tcpSocket.onopen();
			expect(_sut._onopen).toHaveBeenCalledWith(tcpSocket, data, waitForResponse, jasmine.any(Function));

			expect(typeof tcpSocket.ondata).toBe("function");
			tcpSocket.ondata(dataReceived);
			expect(_sut._ondata).toHaveBeenCalledWith(dataReceived, tcpSocket, jasmine.any(Function));

			expect(typeof tcpSocket.onerror).toBe("function");

			expect(tcpSocket.open).toHaveBeenCalledWith(ip, port);
		});
	});
	describe("_onopen", function () {
		it("should do nothing when the socket fails to close", function () {
			//arrange
			var socket = jasmine.createSpyObj("socket", ["close"]);
			var data = "the data";
			var waitForResponse = true;
			var responseTimeout = "my response timeout";
			
			_sut.responseTimeout = responseTimeout;
			_mockSocketSender.send = jasmine.createSpy("send");
			_mockTimers.setTimeout = jasmine.createSpy("setTimeout");
			socket.close.and.callFake(function () { throw new Error("close failed"); });
			
			//act
			_sut._onopen(socket, data, waitForResponse, null);
			
			//assert
			expect(_mockSocketSender.send).toHaveBeenCalledWith(socket, data, waitForResponse);
			expect(_mockTimers.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), responseTimeout);
			_mockTimers.setTimeout.calls.argsFor(0)[0]();
			expect(socket.close).toHaveBeenCalledWith();
		});
		it("should reject the promise when the socket successfully closes", function () {
			//arrange
			var reject = jasmine.createSpy("reject"); 
			var socket = jasmine.createSpyObj("socket", ["close"]);
			var data = "the data";
			var waitForResponse = true;
			var responseTimeout = 5000;
			
			_sut.responseTimeout = responseTimeout;
			_mockSocketSender.send = jasmine.createSpy("send");
			_mockTimers.setTimeout = jasmine.createSpy("setTimeout");
			
			//act
			_sut._onopen(socket, data, waitForResponse, reject);
			
			//assert
			expect(_mockSocketSender.send).toHaveBeenCalledWith(socket, data, waitForResponse);
			expect(_mockTimers.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), responseTimeout);
			_mockTimers.setTimeout.calls.argsFor(0)[0]();
			expect(socket.close).toHaveBeenCalledWith();
			expect(reject).toHaveBeenCalledWith('Device did not respond within ' + (responseTimeout / 1000) + ' seconds.');
		});		
	});
	describe("_ondata", function () {
		it("should close socket then resolve the promise with the data received", function () {
			//arrange
			var dataReceived = "the data";
			var socket = jasmine.createSpyObj("socket", ["close"]);
			var resolve = jasmine.createSpy("resolve");
			
			//act
			_sut._ondata(dataReceived, socket, resolve);
			
			//assert
			expect(socket.close).toHaveBeenCalledWith();
			expect(resolve).toHaveBeenCalledWith(dataReceived);
		});
	});
});