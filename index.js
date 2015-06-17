const SdkResolver = require("./lib/SdkResolver");
const CompositionRoot = require("./CompositionRoot");


var sdkResolver = new SdkResolver();
var compositionRoot = new CompositionRoot(sdkResolver.resolve());

module.exports = compositionRoot;