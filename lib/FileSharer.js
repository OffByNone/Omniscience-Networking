"use strict";
class FileSharer {
    constructor(httpServer, urlProvider, md5) {
        this._server = httpServer;
        this._urlProvider = urlProvider;
        this._md5 = md5;
    }
    shareFile(file, serverIP) {
		let filePathHash = this._md5(file.path);
		let filePath = `/${filePathHash}/${file.name}`;
		let encodedFilePath = encodeURI(filePath);

        if (file.isLocal || !this._urlProvider.isValidUri(file.path))
            return "http://" + serverIP + ":" + this._server.port + this._server.registerFile(encodedFilePath, file.path);
        else
            return file.path;
    }
}

module.exports = FileSharer;