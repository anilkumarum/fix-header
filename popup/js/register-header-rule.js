import { standardRequestHeaders, standardResponseHeaders } from "./constant.js";
import { getAllHeaderRules } from "../db/header-rule-db.js";
import { HeaderRule } from "../db/HeaderRule.js";
import { ReportBug } from "../components/helper/report-bug.js";

/**@param {HeaderRule} headerRule*/
export async function registerHeaderRule(headerRule) {
	const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

	function getOperation(headerKey) {
		if (standardRequestHeaders[headerKey] || standardResponseHeaders) return "append";
		return "set";
	}

	const headerItem = (header) => ({
		operation: header.operation === "append" ? getOperation(header.key) : header.operation,
		header: header.key.trim(),
		value: header.operation !== "remove" ? header.value.trim() : "",
	});

	/**@type {(urlFilter:string,index:number)=>chrome.declarativeNetRequest.Rule} */
	const rule = (urlFilter, index) => {
		const requestHeaders = headerRule.requestHeaders.map(headerItem).filter((rule) => rule.header);
		const responseHeaders = headerRule.responseHeaders.map(headerItem).filter((rule) => rule.header);
		return {
			id: existingRules.length + 1 + index,
			action: {
				type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
				requestHeaders: requestHeaders.length !== 0 ? requestHeaders : undefined,
				responseHeaders: responseHeaders.length !== 0 ? responseHeaders : undefined,
			},
			condition: {
				urlFilter: urlFilter,
				resourceTypes: headerRule.resourceTypes.length !== 0 ? headerRule.resourceTypes : undefined,
				requestMethods: headerRule.requestMethods.length !== 0 ? headerRule.requestMethods : undefined,
				excludedResourceTypes:
					headerRule.excludedResourceTypes.length !== 0 ? headerRule.excludedResourceTypes : undefined,
				excludedRequestMethods:
					headerRule.excludedRequestMethods.length !== 0 ? headerRule.excludedRequestMethods : undefined,
			},
		};
	};
	const addRules = headerRule.matchUrls.map(rule);

	try {
		await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: headerRule.ruleIds, addRules });
		await requestPermission(headerRule.matchUrls);
		return addRules.map((rule) => rule.id);
	} catch (error) {
		notify(error.message, "error");
		console.error(error);
		document.body.appendChild(new ReportBug(error));
	}
}

export async function updateHeaderRule(ruleIds, key, value) {
	try {
		// @ts-ignore
		const headerRules = await chrome.declarativeNetRequest.getDynamicRules({ ruleIds });
		function getOperation(headerKey) {
			if (standardRequestHeaders[headerKey] || standardResponseHeaders) return "append";
			return "set";
		}

		const headerItem = (header) => ({
			operation: header.operation === "append" ? getOperation(header.key) : header.operation,
			header: header.key.trim(),
			value: header.operation !== "remove" ? header.value.trim() : "",
		});
		if (key === "requestHeaders") {
			const requestHeaders = value.map(headerItem).filter((rule) => rule.header);
			// @ts-ignore
			for (const headerRule of headerRules) headerRule.action.requestHeaders = requestHeaders;
		} else if (key === "responseHeaders") {
			const responseHeaders = value.map(headerItem).filter((rule) => rule.header);
			// @ts-ignore
			for (const headerRule of headerRules) headerRule.action.responseHeaders = responseHeaders;
		}
		// @ts-ignore
		chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds, addRules: headerRules });
	} catch (error) {
		notify(error.message, "error");
		console.error(error);
		document.body.appendChild(new ReportBug(error));
	}
}

export async function unRegisterHeaderRule(ruleIds) {
	try {
		await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds });
	} catch (error) {
		console.error(error);
	}
}

export async function requestPermission(webpages) {
	const hasPermission = await chrome.permissions.contains({ origins: webpages });
	if (hasPermission) return $("rule-editor-dialog")?.remove();
	const { HostPermission } = await import("../components/helper/host-permission.js");
	const parentElement = $("rule-editor-dialog").shadowRoot.firstElementChild ?? document.body;
	parentElement.appendChild(new HostPermission(webpages));
}

export async function registerHeaderRuleOnUpdate() {
	const headerRules = await getAllHeaderRules();
	headerRules.forEach(registerHeaderRule);
}

export async function unRegisterAllHeaderRule() {
	try {
		const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: existingRules.map((rule) => rule.id),
		});
	} catch (error) {
		console.error(error);
	}
}

/* 
sample
https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/*
https://developer.mozilla.org/en-US/docs/Web/HTTP/*
X-Modified-By 
fixHeader
*/
