import "./url-filter-popup.js";
import "../editor/header-table.js";
import { html } from "../../js/om.compact.js";
import { HeaderRule } from "../../db/HeaderRule.js";
import { UrlFilterPopup } from "./url-filter-popup.js";
import { HeaderTable } from "../editor/header-table.js";
import { deleteHeaderRuleInDb, updateHeaderRuleInDb } from "../../db/header-rule-db.js";
import { registerHeaderRule, unRegisterHeaderRule, updateHeaderRule } from "../../js/register-header-rule.js";

export class HeaderRuleCard extends HTMLElement {
	/** @param {HeaderRule} headerRule*/
	constructor(headerRule) {
		super();
		this.headerRule = headerRule;
	}

	async openEditorDialog() {
		const { RuleEditorDialog } = await import("../editor/rule-editor-dialog.js");
		const editorDialog = new RuleEditorDialog(this.headerRule);
		document.body.appendChild(editorDialog);
	}

	async deleteRule() {
		try {
			await unRegisterHeaderRule(this.headerRule.ruleIds);
			await deleteHeaderRuleInDb(this.headerRule.id);
			this.remove();
			toast("Rule deleted");
		} catch (error) {
			console.error(error);
		}
	}

	async updateRequestHeaders() {
		await updateHeaderRule(this.headerRule.ruleIds, "requestHeaders", this.headerRule.requestHeaders);
		await updateHeaderRuleInDb(this.headerRule.id, "requestHeaders", this.headerRule.requestHeaders);
	}

	async updateResponseHeaders() {
		await updateHeaderRule(this.headerRule.ruleIds, "responseHeaders", this.headerRule.responseHeaders);
		await updateHeaderRuleInDb(this.headerRule.id, "responseHeaders", this.headerRule.responseHeaders);
	}

	async updateRuleName({ target }) {
		await updateHeaderRuleInDb(this.headerRule.id, "name", target.value).catch((err) => console.error(err));
	}

	async toggleHeaderRule({ target }) {
		await updateHeaderRuleInDb(this.headerRule.id, "enable", target.checked);
		if (!target.checked) return unRegisterHeaderRule(this.headerRule.ruleIds);
		await registerHeaderRule(this.headerRule);
	}

	render() {
		return html`<input
				type="checkbox"
				name="toggleHeaderRule"
				class="toggle_rule"
				?checked=${this.headerRule.enable}
				@change=${this.toggleHeaderRule.bind(this)} />
			<rule-details>
				<div class="left-column">
					<label>
						<span>${i18n("name")}:</span>
						<input type="text" name="rule-name" value="${this.headerRule.name}" @change=${this.updateRuleName} />
					</label>

					<details name="requestHeaders" @toggle=${this.updateRequestHeaders.bind(this)}>
						<summary><web-icon ico="request"></web-icon> <span>${i18n("request")}</span></summary>
					</details>
				</div>

				<div class="center-column"></div>
				<div class="right-column">
					<details name="responseHeaders" @toggle=${this.updateResponseHeaders.bind(this)}>
						<summary><web-icon ico="response"></web-icon><span>${i18n("response")}</span></summary>
					</details>
				</div>
			</rule-details>
			<web-icon
				ico="edit"
				title="edit rule"
				class="edit-icon"
				@click=${this.openEditorDialog.bind(this)}></web-icon>
			<web-icon
				ico="delete"
				title="delete rule"
				class="delete-icon"
				@click=${this.deleteRule.bind(this)}></web-icon>`;
	}

	connectedCallback() {
		this.id = this.headerRule.id;
		this.replaceChildren(this.render());
		const reqHeaderTable = new HeaderTable(this.headerRule.requestHeaders, "request");
		const respHeaderTable = new HeaderTable(this.headerRule.responseHeaders, "response");
		$(".right-column", this).prepend(new UrlFilterPopup(this.headerRule));
		$('details[name="requestHeaders"]', this).appendChild(reqHeaderTable);
		$('details[name="responseHeaders"]', this).appendChild(respHeaderTable);
	}
}

customElements.define("rule-card", HeaderRuleCard);
