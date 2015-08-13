var httpServer;

module.exports.main = function main() {
	//extension startup

	const CompositionRoot = require("./bin/index");
	let compositionRoot = new CompositionRoot();

	httpServer = compositionRoot.createSimpleServer();
	httpServer.start();

	let file = { path: "\\AbsolutePathHere\BigBuckBunny.mp4", name: "BigBuckBunny.mp4", isLocal: true };

	console.log(httpServer.registerFile(file, "192.168.1.4"));
};

require("sdk/system/unload").when(function (reason) {
	//extension shutdown
	if (httpServer && httpServer.isRunning)
		httpServer.stop();
});