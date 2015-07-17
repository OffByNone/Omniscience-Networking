require("babel/register");

const Constants = require('../lib/Constants');
const TCPSocketProvider = require("../lib/TCPSocketProvider");

describe("TCPSocketProvider", function () {
	var _sut;
	var _mockTCPSocketCreator;
	beforeEach(function () {
		_mockTCPSocketCreator = jasmine.createSpy("mockTCPSocketCreator");
		_sut = new TCPSocketProvider(_mockTCPSocketCreator);
	});
	describe("createTCPSocket", function () {
		it("should return a new TCP Socket", function () {
			//arrange
			var newTCPSocket = "a new tcp socket";

			_mockTCPSocketCreator.and.returnValue(newTCPSocket);
			
			//act
			var actual = _sut.createTCPSocket();
			
			//assert
			expect(actual).toBe(newTCPSocket);
		});
	});
});