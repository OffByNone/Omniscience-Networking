///<reference path="./support/jasmine.d.ts" />

require("babel/register");

const Constants = require('../lib/Constants');
const NetworkingUtils = require("../lib/NetworkingUtils");

describe("NetworkingUtils", function () {
	var _sut;
	beforeEach(function () {
		_sut = NetworkingUtils;
	});
	describe("toBuffer", function () {
		it("should convert to byte array then return buffer when string is passed in", function () {
			//arrange
			var convertThis = "convertThis";
			var myBuffer = "the buffer";
			var objectWithBuffer = { buffer: myBuffer };

			spyOn(_sut, 'toByteArray').and.returnValue(objectWithBuffer);
			//act
			var actual = _sut.toBuffer(convertThis);
			
			//assert
			expect(actual).toBe(myBuffer);
		});
		it("should return the byte array's buffer when a type of Uint8Array is passed in", function () {
			//arrange
			var buffer = new ArrayBuffer(8);
			var convertThis = new Uint8Array(buffer);
			convertThis.set([1, 2, 3, 4, 5, 6, 7]);

			//act
			var actual = _sut.toBuffer(convertThis);
			
			//assert
			expect(actual).toBe(convertThis.buffer);
		});
		it("should throw an error when the object passed in is neither a string nor a Uint8Array", function () {
			//arrange
			var convertThis = {};

			try {
				//act
				_sut.toBuffer(convertThis);
				fail("error should have been throw");
			}
			catch (e) { 
				expect(e.message).toBe("argument must be of type string or Uint8Array");
			}
			
		});		
	});
	describe("parseRange", function () {
		it("should return 0 when rangeHeader is null", function () {
			//arrange
			var rangeHeader = null;
			
			//act
			var actual = _sut.parseRange(rangeHeader);
			
			//assert
			expect(actual).toBe(0);
		});
		it("should return 0 when rangeHeader type is not equal to bytes", function () {
			//arrange
			var rangeHeader = "not bytes=doesnt matter";
			
			//act
			var actual = _sut.parseRange(rangeHeader);
			
			//assert
			expect(actual).toBe(0);
		});
		it("should return absolute value of byte offset", function () {
			//arrange
			var byteOffset = -120;
			var rangeHeader = "bytes=" + byteOffset;
			
			//act
			var actual = _sut.parseRange(rangeHeader);
			
			//assert
			expect(actual).toBe(Math.abs(byteOffset));
		});
		it("should return absolute value of byte offset", function () {
			//arrange
			var byteOffset = 120;
			var rangeHeader = "bytes=" + byteOffset;
			
			//act
			var actual = _sut.parseRange(rangeHeader);
			
			//assert
			expect(actual).toBe(byteOffset);
		});
	});
	describe("offsetBytes", function () {
		it("should return fileBytes when offset is null", function () {
			//arrange
			var offset = null;
			var fileBytes = 10;
			
			//act
			var actual = _sut.offsetBytes(offset, fileBytes);
			
			//assert
			expect(actual).toBe(fileBytes);
		});
		it("should return fileBytes when offset is 0", function () {
			//arrange
			var offset = 0;
			var fileBytes = 10;
			
			//act
			var actual = _sut.offsetBytes(offset, fileBytes);
			
			//assert
			expect(actual).toBe(fileBytes);
		});
		it("should return fileBytes starting at the index equal to offset when offset is greater than 0", function () {
			//arrange
			var offset = 2;
			var buffer = new ArrayBuffer(8);
			var fileBytes = new Uint8Array(buffer);
			fileBytes.set([1, 2, 3, 4, 5, 6, 7]);
			
			//act
			var actual = _sut.offsetBytes(offset, fileBytes);
			
			//assert
			expect(actual).toEqual(fileBytes.subarray(offset));
		});
	});
});