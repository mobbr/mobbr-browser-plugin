if (window == top) {
	chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
		sendResponse(findParticipation());
	});
}

var findParticipation = function() {
	var participation = document.getElementsByName("participation");
	if (participation.length > 0) {
		return window.location.href;
	}
	return "";
}