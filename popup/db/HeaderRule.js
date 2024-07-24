export class Header {
	/**@param {string} key @param {string} value*/
	constructor(key = "", value = "") {
		this.key = key;
		this.value = value;
		this.operation = "set";
		this.enable = true;
	}
}

export class HeaderRule {
	constructor() {
		this.id = crypto.randomUUID();
		this.enable = true;
		this.name = "";
		this.priority = 1;
		/**@type {string[]} */
		this.matchUrls = [];
		/**@type {Header[]} */
		this.requestHeaders = [];
		/**@type {Header[]} */
		this.responseHeaders = [];
		/**@type {chrome.declarativeNetRequest.ResourceType[]} */
		this.resourceTypes = [];
		/**@type {chrome.declarativeNetRequest.ResourceType[]} */
		this.excludedResourceTypes = [];
		/**@type {chrome.declarativeNetRequest.RequestMethod[]} */
		this.requestMethods = [];
		/**@type {chrome.declarativeNetRequest.RequestMethod[]} */
		this.excludedRequestMethods = [];
		/**@type {number[]} */
		this.ruleIds = [];
		this.lastModifiedAt = Date.now();
		this.createdAt = Date.now();

		/* this.tabIds = [];
		this.excludedTabIds = [];
		this.initiatorDomains = [];
		this.excludedInitiatorDomains = [];
		this.excludedRequestDomains = [];
		this.requestDomains = []; */
	}
}
