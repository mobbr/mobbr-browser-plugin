function setUrl() {
	var task = document.getElementById("task");
	var no_task = document.getElementById("no_task");

	var url = chrome.extension.getBackgroundPage().selectedUrl;

	if (url) {
		task.href = "https://mobbr.com/#/task/" + window.btoa(url);
		
		task.style.display = 'block';
		no_task.style.display = 'none';
	} else {
		task.style.display = 'none';
		no_task.style.display = 'block';
	}
}

window.onload = setUrl;
