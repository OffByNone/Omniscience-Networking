const SdkResolver = require("omniscience-sdk-resolver");
const CompositionRoot = require("./CompositionRoot");


var sdkResolver = new SdkResolver();
var compositionRoot = new CompositionRoot(sdkResolver.resolve());

module.exports = compositionRoot;