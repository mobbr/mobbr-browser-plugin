var urls = {};
var selectedUrl = null;
var selectedId = null;
var mobbrEnabledUrlBadgeText = '1';

function getHost(url) {
	var parser = document.createElement('a');
	parser.href = url;
	return parser.hostname;
}

function hostFound(host, api_connections) {
	for (var i = 0; i < api_connections.length; i++) {
		var conn = api_connections[i];
		if(conn.hasOwnProperty('host') && conn.host.toLowerCase() == host) {
			return true;
		}
	};
	return false;
}

function updateSelected(tabId) {
	selectedUrl = urls[tabId];

	console.log("updateSelected - tabId: " + tabId + ", selectedUrl: " + selectedUrl);
}

function mobbrEnabledUrl(tabId, badgeText) {
	chrome.browserAction.setBadgeText({text: badgeText, tabId: tabId});
	if (selectedId == tabId) {
		updateSelected(tabId);
	}
}

var detectApi_cache = new LRUCache(20);
function detectApi(url, tabId) {
	var host = getHost(url).toLowerCase();
	var cached_val = detectApi_cache.get(host);
	if(cached_val != undefined)	{
		if(cached_val) {
			mobbrEnabledUrl(tabId, mobbrEnabledUrlBadgeText);
		}
		return;
	}

	var options = {
		url: 'https://api.mobbr.com/api_v1/api/api_connections', 
		method: 'GET', 
		headers: {Accept: 'application/json'}
	};
	
	nanoajax.ajax(options, function (code, responseText) {
		if(code == 200) {
			if(hostFound(host, JSON.parse(responseText)["result"])) {
				mobbrEnabledUrl(tabId, mobbrEnabledUrlBadgeText);
				detectApi_cache.set(host, true);
			}
			else {
				detectApi_cache.set(host, false);
			}
		}
	});
}

function showGreenIcon(tabId) {
	chrome.browserAction.setIcon({path: "icons/icon-green.png", tabId: tabId});
}

var detectPayment_cache = new LRUCache(20);
function detectPayment(url, tabId) {
	var cached_val = detectPayment_cache.get(url);
	if(cached_val != undefined)	{
		if(cached_val) {
			showGreenIcon(tabId);
		}
		return;
	}

	var options = {
		url: 'https://api.mobbr.com/api_v1/balances/uri?url='+url,
		method: 'GET',
		headers: {Accept: 'application/json'}
	};

	nanoajax.ajax(options, function (code, responseText) {
		if(code == 200) {
			var response = JSON.parse(responseText);
			if(response.result.total_amount > 0) {
				showGreenIcon(tabId);
				detectPayment_cache.set(url, true);
			}
			else {
				detectPayment_cache.set(url, false);
			}
		}
	});
}

function updateUrl(tabId) {
	chrome.tabs.sendRequest(tabId, {reqType: "findParticipation"}, function(response) {
		console.log("updateUrl - tabId: " + tabId + ", response: " + JSON.stringify(response));
		
		if (!(typeof response != 'undefined')) return;
		
		if (urls[tabId] != response.url)
			chrome.tabs.sendRequest(tabId, {reqType: "hideLightbox"});
		
		urls[tabId] = response.url;

		chrome.browserAction.setBadgeText({text: "", tabId: tabId});
		if (response.participation) {
			mobbrEnabledUrl(tabId, response.numberParticipants.toString());
		} else {
			detectApi(response.url, tabId);
		}
		detectPayment(response.url, tabId);
	});
}

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
	console.log("chrome.tabs.onReplaced - addedTabId: " + addedTabId + ", removedTabId: " + removedTabId);
	
	updateUrl(addedTabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
	console.log("chrome.tabs.onUpdated - tabId: " + tabId + ", change: " + JSON.stringify(change));

	if (change.status == "complete") {
		updateUrl(tabId);
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log("chrome.tabs.onActivated - activeInfo: " + JSON.stringify(activeInfo));
	
	selectedId = activeInfo.tabId;
	updateSelected(activeInfo.tabId);
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	updateUrl(tabs[0].id);
});

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendRequest(tab.id, {reqType: "openLightbox"});
});
