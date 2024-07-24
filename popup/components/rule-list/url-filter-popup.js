import { updateHeaderRuleInDb } from "../../db/header-rule-db.js";
import { HeaderRule } from "../../db/HeaderRule.js";
import { html, map } from "../../js/om.compact.js";
import { registerHeaderRule } from "../../js/register-header-rule.js";

export class UrlFilterPopup extends HTMLDetailsElement {
	/** @param {HeaderRule} headerRule*/
	constructor(headerRule) {
		super();
		this.headerRule = headerRule;
		this.matchUrls = headerRule.matchUrls;
	}

	async updateHeaderRule() {
		try {
			await updateHeaderRuleInDb(this.headerRule.id, "matchUrls", this.headerRule.matchUrls);
			this.headerRule.ruleIds = await registerHeaderRule(this.headerRule);
			await updateHeaderRuleInDb(this.headerRule.id, "ruleIds", this.headerRule.ruleIds);
		} catch (error) {
			console.error(error);
		}
	}

	removeMatchUrl({ currentTarget, target }) {
		const li = target.closest("li");
		const url = li.title;
		const idx = this.matchUrls.indexOf(url);
		if (idx !== -1) this.matchUrls.splice(idx, 1);
		if (!target.closest("web-icon")) currentTarget.previousElementSibling.previousElementSibling.value = url;
		this.updateHeaderRule();
	}

	async addMatchUrl({ code, target }) {
		if (code !== "Enter") return;
		this.matchUrls.push(target.value);
		target.nextElementSibling.prepend(this.chipItem(target.value));
		target.value = "";
		this.updateHeaderRule();
	}

	chipItem = (url) =>
		html`<li class="chip-item" title="${url}">
			<span>${url.slice(0, 32)}</span> <web-icon ico="close" title="remove"></web-icon>
		</li>`;

	render() {
		return html`<summary>
				${i18n("matches")}:<var>${this.matchUrls[0].slice(0, 16) ?? "No page match"}</var>
			</summary>
			<div class="match-urls">
				<input type="url" list="tab-urls" @keyup=${this.addMatchUrl.bind(this)} />
				<ul @click=${this.removeMatchUrl.bind(this)}>
					${map(this.matchUrls, this.chipItem)}
				</ul>
			</div>`;
	}

	connectedCallback() {
		this.id = "url-filter-popup";
		this.replaceChildren(this.render());
	}
}

customElements.define("url-filter-popup", UrlFilterPopup, { extends: "details" });
