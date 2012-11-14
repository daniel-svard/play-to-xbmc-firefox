var linkTargetFinder = function () {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return {
		init : function () {
		},
			
		run : function () {
//			alert(window.content.location.href);
//            alert(getURL());
//            playCurrentUrl();
            queueItem(window.content.location.href);
		}
	};
}();
window.addEventListener("load", linkTargetFinder.init, false);

function getURL() {
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var url = prefManager.getCharPref("xbmc.url");
    var port = prefManager.getCharPref("xbmc.port");
    return 'http://' + url + ':' + port;
}