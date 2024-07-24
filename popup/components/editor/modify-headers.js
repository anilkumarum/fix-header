import { requestHeaders, responseHeaders } from "../../js/constant.js";
import { Header } from "../../db/HeaderRule.js";
import { html } from "../../js/om.compact.js";
import { HeaderTable } from "./header-table.js";

export class ModifyHeaders extends HTMLElement {
	/** @param {Header[]} requestHeaders @param {Header[]} responseHeaders*/
	constructor(requestHeaders, responseHeaders) {
		super();
		this.requestHeaders = requestHeaders;
		this.responseHeaders = responseHeaders;
	}

	switchTab({ target }) {
		if (target.checked) {
			const index = target.value === "request-header" ? 0 : 1;
			this.lastElementChild.children[index].scrollIntoView({ behavior: "smooth", inline: "start" });
		}
	}

	render() {
		return html`<header @change=${this.switchTab.bind(this)}>
				<label>
					<web-icon ico="request"></web-icon>
					<input type="radio" name="request-response" value="request-header" hidden checked />
					<span>${i18n("request")}</span>
				</label>
				<label>
					<web-icon ico="response"></web-icon>
					<input type="radio" name="request-response" value="response-header" hidden />
					<span>${i18n("response")}</span>
				</label>
			</header>
			<datalist id="request-headers">${requestHeaders.map((url) => `<option value="${url}"></option>`)}</datalist>
			<datalist id="response-headers">
				${responseHeaders.map((url) => `<option value="${url}"></option>`)}
			</datalist>
			<section></section>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		this.lastElementChild.append(
			new HeaderTable(this.requestHeaders, "request"),
			new HeaderTable(this.responseHeaders, "response")
		);
	}
}

customElements.define("modify-headers", ModifyHeaders);
