import { HeaderRule } from "../popup/db/HeaderRule.js";
import { insertMultiHeaderRuleInDb, saveHeaderRuleInDb } from "../popup/db/header-rule-db.js";
import { registerHeaderRule } from "../popup/js/register-header-rule.js";

globalThis.eId = document.getElementById.bind(document);
globalThis.$on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);
globalThis.$ = (selector, scope) => (scope || document).querySelector(selector);

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

//Import rules
const input = eId("import-rules");
$on(input, "change", importRules);

function importRules(event) {
	const file = event.target.files[0];
	const reader = new FileReader();
	reader.onload = async (evt) => {
		const textData = evt.target.result;
		if (typeof textData !== "string") return;
		try {
			const jsonData = JSON.parse(textData);
			const rule1 = Array.isArray(jsonData) ? jsonData[0] : jsonData;
			if (rule1.action === undefined || rule1.action === undefined)
				return alert("Action or condition property missing");
			if (rule1.action?.type !== "modifyHeaders") return alert("ruleType must be modifyHeaders");
			insertImportedRulesInDb(jsonData);
		} catch (error) {
			alert("Invalid json data");
		}
	};
	reader.onerror = (event) => console.error(event);
	reader.readAsText(file);
}

async function insertImportedRulesInDb(jsonData) {
	async function formatRule(rule) {
		const requestHeaders = rule.action.requestHeaders;
		const responseHeaders = rule.action.responseHeaders;
		if (requestHeaders.length === 0 || responseHeaders?.length === 0) return;
		if (!rule.condition.urlFilter) return;
		const headerRule = new HeaderRule();
		headerRule.requestHeaders = requestHeaders;
		headerRule.responseHeaders = responseHeaders;
		headerRule.resourceTypes = rule.condition.resourceTypes ?? ["main_frame"];
		headerRule.matchUrls = [rule.condition.urlFilter];
		headerRule.ruleIds = await registerHeaderRule(headerRule);
		return headerRule;
	}
	if (Array.isArray(jsonData)) {
		const rulePromises = jsonData
			.filter((rule) => rule.action.requestHeaders || rule.action.responseHeaders)
			.map(formatRule);
		const headerRules = await Promise.all(rulePromises);
		insertMultiHeaderRuleInDb(headerRules);
	} else {
		const headerRule = await formatRule(jsonData);
		headerRule && saveHeaderRuleInDb(headerRule);
	}
}
