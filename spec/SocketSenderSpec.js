///<reference path="./support/jasmine.d.ts" />

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
			var socket = {};
			var message = "my message";
			var keepAlive = "why not";

			spyOn(_sut, "_sendNextPart");
			
			//act
			_sut.send(socket, message, keepAlive);
			
			//assert
			expect(_sut._sendNextPart).toHaveBeenCalledWith(socket, 0, message.length, message, keepAlive);
			expect(typeof socket.ondrain).toBe("function");
			socket.ondrain();
			expect(_sut._sendNextPart).toHaveBeenCalledWith();
		});
	});
	describe("_sendNextPart", function () {
		it("should send data over the socket and do nothing else when the whole message has been sent and keep alive is true", function () {
			//arrange
			var offset = 0;
			var remaining = 37;
			var response = "the response";
			var keepAlive = true;
			var socket = jasmine.createSpyObj("socket", ["send"]);

			socket.send.and.returnValue(false);			
			
			//act
			_sut._sendNextPart(socket, offset, remaining, response, keepAlive);
			
			//assert
			expect(socket.send.calls.count()).toBe(1);
			expect(socket.send).toHaveBeenCalledWith(response, offset, remaining);
		});
		it("should close the socket when the message has been fully sent and keep alive is false", function () {
			//arrange
			var offset = 0;
			var remaining = Constants.socketBufferSize - 1000;
			var response = "the response";
			var keepAlive = false;
			var socket = jasmine.createSpyObj("socket", ["send", "close"]);

			socket.send.and.returnValue(false);
			
			//act
			_sut._sendNextPart(socket, offset, remaining, response, keepAlive);
			
			//assert
			expect(socket.send.calls.count()).toBe(1);
			expect(socket.send).toHaveBeenCalledWith(response, offset, remaining);
			expect(socket.close).toHaveBeenCalledWith();
		});
		it("should send data over the socket and do nothing else when the whole message has not been sent but the buffer is full", function () {
			//arrange
			var offset = 0;
			var remaining = Constants.socketBufferSize + 1000;
			var response = "the response";
			var keepAlive = true;
			var socket = jasmine.createSpyObj("socket", ["send"]);

			socket.send.and.returnValue(true);
			
			//act
			_sut._sendNextPart(socket, offset, remaining, response, keepAlive);
			
			//assert
			expect(socket.send.calls.count()).toBe(1);
			expect(socket.send).toHaveBeenCalledWith(response, offset, Constants.socketBufferSize);
		});
		it("should call socket.send twice when the message takes two times to be fully sent and the buffer is not full", function () {
			//arrange
			var offset = 0;
			var remaining = Constants.socketBufferSize + 1000;
			var response = "the response";
			var keepAlive = true;
			var socket = jasmine.createSpyObj("socket", ["send"]);

			socket.send.and.returnValue(false);
			
			//act
			_sut._sendNextPart(socket, offset, remaining, response, keepAlive);
			
			//assert
			expect(socket.send.calls.count()).toBe(2);
			expect(socket.send).toHaveBeenCalledWith(response, offset, Constants.socketBufferSize);
			expect(socket.send).toHaveBeenCalledWith(response, Constants.socketBufferSize, 1000);
		});
	});
});