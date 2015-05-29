function openLightbox() {
	mobbr.createDiv();
	mobbr.makePayment(window.location.href);
}

if (window == top) {
	chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
		if (req.reqType == "participation") {
			sendResponse(findParticipation());
		}
		else if (req.reqType == "lightbox") {
			openLightbox();
		}
	});
}

var findParticipation = function() {
	var participation = document.getElementsByName("participation");
	if (participation.length > 0) {
		return {url: window.location.href, participation: true};
	}
	return {url: window.location.href, participation: false};
}