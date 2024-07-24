import { registerHeaderRuleOnUpdate, unRegisterAllHeaderRule } from "../js/register-header-rule.js";
import { html } from "../js/om.compact.js";
// @ts-ignore
import topbarCss from "../style/top-bar.css" assert { type: "css" };

export class TopBar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [topbarCss];
	}

	async addRule() {
		const { RuleEditorDialog } = await import("./editor/rule-editor-dialog.js");
		const createRuleDialog = new RuleEditorDialog();
		document.body.appendChild(createRuleDialog);
	}

	toggleHeaderRule({ target }) {
		const isEnable = target.checked;
		this.nextElementSibling["inert"] = !isEnable;
		chrome.storage.local.set({ modHeaderEnable: isEnable });
		isEnable ? registerHeaderRuleOnUpdate() : unRegisterAllHeaderRule();
	}

	render() {
		return html` <button @click=${this.addRule}>
				<web-icon ico="plus" title="add rule"></web-icon>
				<span>${i18n("add_rule")}</span>
			</button>
			<span>fixHeader</span>
			<label class="switch">
				<input type="checkbox" checked @change=${this.toggleHeaderRule.bind(this)} />
				<span class="slider"></span>
			</label>`;
	}

	connectedCallback() {
		this.shadowRoot.replaceChildren(this.render());
		getStore("modHeaderEnable").then(({ modHeaderEnable }) => {
			$("input", this.shadowRoot).checked = modHeaderEnable;
		});
	}
}

customElements.define("top-bar", TopBar);
