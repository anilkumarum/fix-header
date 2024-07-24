import { registerHeaderRule } from "../../js/register-header-rule.js";
import { saveHeaderRuleInDb } from "../../db/header-rule-db.js";
import { addHeaderRuleElem } from "../rule-list/rule-list.js";
import { AdvancedOptions } from "./advanced-options.js";
import { html, react } from "../../js/om.compact.js";
import { resourceTypes } from "../../js/constant.js";
import { ModifyHeaders } from "./modify-headers.js";
import { HeaderRule } from "../../db/HeaderRule.js";
import { UrlFilter } from "./url-filter.js";
// @ts-ignore
import ruleEditorCss from "../../style/rule-editor.css" assert { type: "css" };

export class RuleEditorDialog extends HTMLElement {
	/** @param {HeaderRule} [headerRule]*/
	constructor(headerRule) {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [ruleEditorCss];
		this.headerRule = react(headerRule ?? new HeaderRule());
	}

	async createHeaderRule() {
		/**@type {HeaderRule} */
		const headerRule = Object.assign({}, this.headerRule);
		headerRule.matchUrls = Object.assign([], this.headerRule.matchUrls);
		headerRule.requestHeaders = this.headerRule.requestHeaders.map((header) => ({ ...header }));
		headerRule.responseHeaders = this.headerRule.responseHeaders.map((header) => ({ ...header }));
		headerRule.resourceTypes = Object.assign([], this.headerRule.resourceTypes);
		headerRule.excludedResourceTypes = Object.assign([], this.headerRule.excludedResourceTypes);
		headerRule.requestMethods = Object.assign([], this.headerRule.requestMethods);
		headerRule.excludedRequestMethods = Object.assign([], this.headerRule.excludedRequestMethods);
		headerRule.ruleIds = Object.assign([], this.headerRule.ruleIds);

		const headerEmpty = headerRule.requestHeaders.length === 0 && headerRule.responseHeaders.length === 0;
		if (headerEmpty) return notify("Atleast one header required", "error");
		if (headerRule.matchUrls.length === 0) {
			headerRule.matchUrls.push($('input[name="match-urls"]', this.shadowRoot).value || "https://*/*");
		}
		// @ts-ignore
		headerRule.resourceTypes.length === 0 && (headerRule.resourceTypes = resourceTypes);

		try {
			const ruleIds = await registerHeaderRule(headerRule);
			headerRule.ruleIds = ruleIds;
			await saveHeaderRuleInDb(headerRule);
			addHeaderRuleElem(headerRule);
			notify("Header rule created");
		} catch (error) {
			console.error(error);
		}
	}

	render() {
		const closeBtn = html`<web-icon
			ico="close-circle"
			class="close-btn"
			@click=${this.remove.bind(this)}></web-icon>`;
		const nameInput = html`<section class="rule-row">
			<label>
				<span>${i18n("rule_name")}</span> <br />
				<input type="text" .value=${() => this.headerRule.name} />
			</label>
			<label style="margin-inline:auto">
				<span>${i18n("priority")}</span> <br />
				<input type="number" .value=${() => this.headerRule.priority} />
			</label>
		</section>`;
		const submitBtn = html`<button @click=${this.createHeaderRule.bind(this)}>
			<web-icon ico="plus" title=""></web-icon> <span>${i18n("create_rule")}</span>
		</button>`;
		return [
			closeBtn,
			nameInput,
			new UrlFilter(this.headerRule.matchUrls),
			new ModifyHeaders(this.headerRule.requestHeaders, this.headerRule.responseHeaders),
			new AdvancedOptions(this.headerRule),
			submitBtn,
		];
	}

	connectedCallback() {
		const dialog = document.createElement("dialog");
		dialog.replaceChildren(...this.render());
		this.shadowRoot.appendChild(dialog);
		document.body.style.width = "42.4rem";
		dialog.showModal();
	}
}

customElements.define("rule-editor-dialog", RuleEditorDialog);
