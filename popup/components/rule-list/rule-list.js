import { requestHeaders, responseHeaders } from "../../js/constant.js";
import { getAllHeaderRules } from "../../db/header-rule-db.js";
import { HeaderRuleCard } from "./rule-card.js";
import { html } from "../../js/om.compact.js";
// @ts-ignore
import ruleListCss from "../../style/header-rule.css" assert { type: "css" };

export function addHeaderRuleElem(headerRule) {
	if (headerRuleList.shadowRoot.getElementById(headerRule.id)) return;
	const headerRuleElem = new HeaderRuleCard(headerRule);
	headerRuleList.shadowRoot.appendChild(headerRuleElem);
	headerRuleList.className &&= "";
}

let headerRuleList;
export class HeaderRuleList extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [ruleListCss];
		headerRuleList = this;
	}

	createDataList(pageUrls) {
		return html`<datalist id="request-headers">
				${requestHeaders.map((url) => `<option value="${url}"></option>`)}
			</datalist>
			<datalist id="response-headers">
				${responseHeaders.map((url) => `<option value="${url}"></option>`)}
			</datalist>

			<datalist id="tab-urls">${pageUrls.map((url) => html`<option value="${url}"></option>`)}</datalist> `;
	}

	render(headerRules) {
		return headerRules.map((headerRule) => new HeaderRuleCard(headerRule));
	}

	async connectedCallback() {
		const headerRules = await getAllHeaderRules();
		if (headerRules.length === 0) return (this.className = "empty");
		const pageUrls = (await chrome.tabs.query({})).map((tab) => tab.url).filter((url) => url);
		this.shadowRoot.replaceChildren(...this.render(headerRules), this.createDataList(pageUrls));
	}
}

customElements.define("header-rule-list", HeaderRuleList);
