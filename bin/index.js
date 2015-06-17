"use strict";

var SdkResolver = require("./lib/SdkResolver");
var CompositionRoot = require("./CompositionRoot");

var sdkResolver = new SdkResolver();
var compositionRoot = new CompositionRoot(sdkResolver.resolve());

module.exports = compositionRoot;