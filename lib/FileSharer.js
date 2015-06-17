class FileSharer {
    constructor(httpServer, urlProvider, md5) {
        this._server = httpServer;
        this._urlProvider = urlProvider;
        this._md5 = md5;
    }
    shareFile(file) {
        var filePathHash = this._md5(file.path);
        var filePath = `/${filePathHash}/${file.name}`;
		var encodedFilePath = encodeURI(filePath);

        if (file.isLocal || !this._urlProvider.toUrl(file.path))
            return this._server.registerFile(encodedFilePath, file.path);
        else
            return file.path;
    }
}

module.exports = FileSharer;