require("babel/register");

const Constants = require('../lib/Constants');
const SocketSender = require("../lib/SocketSender");

describe("SocketSender", function () {
	var _sut;
	beforeEach(function () {
		_sut = new SocketSender();
	});
	describe("send", function () {
		it("should set sendNextPart to ondrain then call sendNextPart", function () {
			//arrange
			var socket = jasmine.createSpyObj("socketSpy", ["send"]);
			var message = "my message";
			var keepAlive = "why not";

			//act
			_sut.send(socket, message, keepAlive);
			 
			//assert
			expect(socket.send).toHaveBeenCalledWith(message, 0, message.length);
			expect(typeof socket.ondrain).toBe("function");
			socket.ondrain();
		});
	});
	it("should send data over the socket and do nothing else when the whole message has been sent and keep alive is true", function () {
		//arrange
		var response = "the response";
		var keepAlive = true;
		var socket = jasmine.createSpyObj("socket", ["send"]);

		socket.send.and.returnValue(false);			
			
		//act
		_sut.send(socket, response, keepAlive);
			
		//assert
		expect(socket.send.calls.count()).toBe(1);
		expect(socket.send).toHaveBeenCalledWith(response, 0, response.length);
	});
	it("should close the socket when the message has been fully sent and keep alive is false", function () {
		//arrange
		var response = "the response";
		var keepAlive = false;
		var socket = jasmine.createSpyObj("socket", ["send", "close"]);

		socket.send.and.returnValue(false);			
			
		//act
		_sut.send(socket, response, keepAlive);
			
		//assert
		expect(socket.send.calls.count()).toBe(1);
		expect(socket.send).toHaveBeenCalledWith(response, 0, response.length);
		expect(socket.close).toHaveBeenCalledWith();
	});
	it("should send data over the socket and do nothing else when the whole message has not been sent but the buffer is full", function () {
		//arrange
		var response = "";
		for (var i = 0; i < Constants.socketBufferSize + 15; i++)
			response += "a";

		var socket = jasmine.createSpyObj("socket", ["send"]);

		socket.send.and.returnValue(true);
			
		//act
		_sut.send(socket, response);
			
		//assert
		expect(socket.send.calls.count()).toBe(1);
		expect(socket.send).toHaveBeenCalledWith(response, 0, Constants.socketBufferSize);
	});
	it("should call socket.send twice when the message takes two times to be fully sent and the buffer is not full", function () {
		//arrange
		var response = "";
		for (var i = 0; i < Constants.socketBufferSize + 150; i++)
			response += "a";

		var socket = jasmine.createSpyObj("socket", ["send", "close"]);

		socket.send.and.returnValue(false);
			
		//act
		_sut.send(socket, response);
			
		//assert
		expect(socket.send.calls.count()).toBe(2);
		expect(socket.send).toHaveBeenCalledWith(response, 0, Constants.socketBufferSize);
		expect(socket.send).toHaveBeenCalledWith(response, Constants.socketBufferSize, 150);
	});
});