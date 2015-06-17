"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpRequest = function HttpRequest() {
	_classCallCheck(this, HttpRequest);

	this.headers = [];
	this.parameters = [];
	this.method = "";
	this.body = "";
	this.path = "";
	this.socket = {};
};

module.exports = HttpRequest;