var urls = {};
var selectedUrl = null;
var selectedId = null;

function getHost(url) {
	var parser = document.createElement('a');
	parser.href = url;
	return parser.hostname;
}

function urlFound(url, api_connections) {
	var host = getHost(url).toLowerCase();
	for (var i = 0; i < api_connections.length; i++) {
		var conn = api_connections[i];
		if(conn.hasOwnProperty('host') && conn.host.toLowerCase() == host) {
			return true;
		}
	};
	return false;
}

function detectApi(url, tabId) {
	var options = {
		url: 'https://api.mobbr.com/api_v1/api/api_connections', 
		method: 'GET', 
		headers: {Accept: 'application/json'}
	};
	
	nanoajax.ajax(options, function (code, responseText) {
		if(code == 200 && urlFound(url, JSON.parse(responseText)["result"]))
		{
			chrome.browserAction.setIcon({path: "icons/mobbr16.png", tabId: tabId});
			if (selectedId == tabId) {
				updateSelected(tabId);
			}
		}
	});
}

function updateUrl(tabId) {
	chrome.tabs.sendRequest(tabId, {reqType: "participation"}, function(response) {
		if(!(typeof response != 'undefined')) {
			return;
		}
		
		urls[tabId] = response.url;

		chrome.browserAction.setIcon({path: "icons/mobbr16gs.png", tabId: tabId});
		if (response.participation) {
			chrome.browserAction.setIcon({path: "icons/mobbr16.png", tabId: tabId});
			if (selectedId == tabId) {
				updateSelected(tabId);
			}
		} else {
			detectApi(response.url, tabId);
		}
	});
}

function updateSelected(tabId) {
	selectedUrl = urls[tabId];
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	if (change.status == "complete") {
		updateUrl(tabId);
	}
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
	selectedId = tabId;
	updateSelected(tabId);
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	updateUrl(tabs[0].id);
});

chrome.browserAction.onClicked.addListener(function(tab) {
});
