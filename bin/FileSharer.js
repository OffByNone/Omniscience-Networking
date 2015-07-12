"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSharer = (function () {
    function FileSharer(httpServer, urlProvider, md5) {
        _classCallCheck(this, FileSharer);

        this._server = httpServer;
        this._urlProvider = urlProvider;
        this._md5 = md5;
    }

    _createClass(FileSharer, [{
        key: "shareFile",
        value: function shareFile(file, serverIP) {
            var filePathHash = this._md5(file.path);
            var filePath = "/" + filePathHash + "/" + file.name;
            var encodedFilePath = encodeURI(filePath);

            if (file.isLocal || !this._urlProvider.isValidUri(file.path)) return "http://" + serverIP + ":" + this._server.port + this._server.registerFile(encodedFilePath, file.path);else return file.path;
        }
    }]);

    return FileSharer;
})();

module.exports = FileSharer;