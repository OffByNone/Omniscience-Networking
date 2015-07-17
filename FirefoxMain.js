var httpServer;

module.exports.main = function main() {
	//extension startup
	
	const CompositionRoot = require("./bin/index");
	let compositionRoot = new CompositionRoot();

	httpServer = compositionRoot.createHttpServer();
	httpServer.port = "12345";
	httpServer.start();
	
	let serverPath = "/b";
	let filePath = "PATH_TO_FILE_HERE\\bigbuckbunny.mp4";
	
	httpServer.registerFile(serverPath, filePath);
};

require("sdk/system/unload").when(function (reason) {
	//extension shutdown
	if (httpServer && httpServer.isRunning)
		httpServer.stop();
});