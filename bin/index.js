"use strict";

var SdkResolver = require("omniscience-sdk-resolver");
var CompositionRoot = require("./CompositionRoot");

var sdkResolver = new SdkResolver();
var compositionRoot = new CompositionRoot(sdkResolver.resolve());

module.exports = compositionRoot;