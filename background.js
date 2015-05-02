var urls = {};
var selectedUrl = null;
var selectedId = null;

function updateUrl(tabId) {
  chrome.tabs.sendRequest(tabId, {}, function(url) {
    urls[tabId] = url;
    if (url == "") {
      chrome.pageAction.hide(tabId);
    } else {
      chrome.pageAction.show(tabId);
      if (selectedId == tabId) {
        updateSelected(tabId);
      }
    }
  });
}

function updateSelected(tabId) {
  selectedUrl = urls[tabId];
  if (selectedUrl)
    chrome.pageAction.setTitle({tabId:tabId, title:selectedUrl});
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
