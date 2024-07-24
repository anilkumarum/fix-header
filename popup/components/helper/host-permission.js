import { html } from "../../js/om.compact.js";

export class HostPermission extends HTMLDialogElement {
	constructor(webpages) {
		super();
		this.webpages = webpages;
	}

	async requestPermission(allPages) {
		const permissions = { origins: allPages ? ["<all_urls>"] : this.webpages };
		const granted = await chrome.permissions.request(permissions);
		if (!granted) return toast("permission denied");
		this.remove();
		$("rule-editor-dialog")?.remove();
	}

	render() {
		return html`<h2 style="text-align: center">${i18n("webpage_permission_required")}</h2>
			<p>${i18n("permission_required_to_modify_http_headers")}</p>
			<ol>
				${this.webpages.map((page) => `<li >${page}</li>`).join("")}
			</ol>
			<button @click=${this.requestPermission.bind(this, false)}>
				${i18n("grant_permission_for_above_webpages")}
			</button>
			<button style="--btn-clr:orange" @click=${this.requestPermission.bind(this, true)}>
				${i18n("grant_permission_for_all_webpages")}
			</button>`;
	}

	connectedCallback() {
		this.id = "host-permission";
		this.replaceChildren(this.render());
		this.showModal();
	}
}

customElements.define("host-permission", HostPermission, { extends: "dialog" });
