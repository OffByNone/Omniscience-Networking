/* global Promise */
const { Cc, Ci, Cu } = require('chrome'); // https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/chrome.html
const { OS } = Cu.import("resource://gre/modules/osfile.jsm"); // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/OSFile.jsm

const createLocalFile = () => Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
const mimeService = () => Cc["@mozilla.org/uriloader/external-helper-app-service;1"].getService(Ci.nsIMIMEService);
const filePicker = () => Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
const windowUtils = require('sdk/window/utils'); // https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/window_utils

const filePickerConstants = Ci.nsIFilePicker;

module.exports.createTCPSocket = () => Cc["@mozilla.org/tcp-socket;1"].createInstance(Ci.nsIDOMTCPSocket);
module.exports.timers = require('sdk/timers'); // https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/timers
module.exports.FileUtilities = {
	create: function (fileInfo) {
        var file = createLocalFile();
        if (typeof fileInfo === "string")
            file.initWithPath(fileInfo);
        if (typeof fileInfo === "object")
            file.initWithFile(fileInfo);
        return file;
    },
	readBytes: function (filePath) {
		return OS.File.read(filePath);
	},
	openFileBrowser: function() {
        return new Promise((resolve, reject) => {
            var filePicker = filePicker();
            filePicker.init(windowUtils.getMostRecentBrowserWindow(), "Choose File(s)", filePickerConstants.modeOpenMultiple);
            filePicker.appendFilters(filePickerConstants.filterAll | filePickerConstants.filterText);

            filePicker.open((result) => {
				if (result == filePickerConstants.returnOK) {
                    var filePickerFiles = filePicker.files;
                    var files = [];
                    while (filePickerFiles.hasMoreElements()) {
                        //todo: at least some of this should probably be in another file
                        var file = this.create(filePickerFiles.getNext());
                        var fileInfo = {
                            path: file.path,
                            name: file.leafName,
                            type: this.getMimeType(file)
                        };

                        files.push(fileInfo);
                    }
                    resolve(files);
                }
            });
        });
    },
	getMimeType: function (file) {
        /*
         * From Mozilla
		 * Gets a content-type for the given file, by
		 * asking the global MIME service for a content-type, and finally by failing
		 * over to application/octet-stream.
		 *
		 * @param file : nsIFile
		 * the nsIFile for which to get a file type
		 * @returns string
		 * the best content-type which can be determined for the file
		 */
        try {
            return mimeService().getTypeFromFile(file);
        }
        catch (e) {
            return "application/octet-stream"; //todo: does this belong in a constants?
        }
    }
};