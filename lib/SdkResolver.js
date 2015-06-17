const FirefoxSdk = require('./sdk/AddonSdk');

class SdkResolver {
	constructor() {

	}
	resolve() {
		return new FirefoxSdk();
	}
}

module.exports = SdkResolver;