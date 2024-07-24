import { resourceTypes, requestMethods } from "../../js/constant.js";
import { DatalistInput } from "./datalist-input.js";
import { HeaderRule } from "../../db/HeaderRule.js";
import { html } from "../../js/om.compact.js";

export class AdvancedOptions extends HTMLDetailsElement {
	/** @param {HeaderRule} headerRule*/
	constructor(headerRule) {
		super();
		this.headerRule = headerRule;
	}

	render() {
		const excludedResourceTypes = resourceTypes;
		const excludedRequestMethods = requestMethods;
		//tabIds,excludedTabIds,
		// initiatorDomains,excludedInitiatorDomains
		// excludedRequestDomains,requestDomains

		const summary = html`<summary>${i18n("advanced_options")}</summary>`;
		return [
			summary,
			new DatalistInput("Resource types", resourceTypes, this.headerRule.resourceTypes),
			new DatalistInput("Excluded resource types", excludedResourceTypes, this.headerRule.excludedResourceTypes),
			new DatalistInput("Request methods", requestMethods, this.headerRule.requestMethods),
			new DatalistInput(
				"Excluded request methods",
				excludedRequestMethods,
				this.headerRule.excludedRequestMethods
			),
		];
	}

	connectedCallback() {
		this.replaceChildren(...this.render());
	}
}

customElements.define("advanced-options", AdvancedOptions, { extends: "details" });
