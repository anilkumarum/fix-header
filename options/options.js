globalThis.eId = document.getElementById.bind(document);
globalThis.$on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);

const btn = eId("export-rules");
$on(btn, "click", exportRules);

//export header rules
async function exportRules() {
	const headerRules = await chrome.declarativeNetRequest.getDynamicRules();
	const jsonData = JSON.stringify(headerRules);
	downloadFile(jsonData);
}

function downloadFile(textData) {
	const fileBlob = new Blob([textData], { type: "application/json" });
	const a = document.createElement("a");
	a.setAttribute("href", URL.createObjectURL(fileBlob));
	a.setAttribute("download", new Date().toISOString() + ".json");
	a.click();
}
