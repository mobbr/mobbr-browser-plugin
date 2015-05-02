function setUrl() {
  var url = chrome.extension.getBackgroundPage().selectedUrl;
  if (url) {
    var link = document.getElementById("url");
    link.href = "https://mobbr.com/#/task/" + window.btoa(url);
  }
}

window.onload = setUrl;