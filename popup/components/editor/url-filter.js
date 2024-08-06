import { html, map } from "../../js/om.compact.js";

export class UrlFilter extends HTMLElement {
	/** @param {string[]} matchUrls*/
	constructor(matchUrls) {
		super();
		this.matchUrls = matchUrls;
	}

	removeMatchUrl({ currentTarget, target }) {
		const url = target.closest("li")?.textContent.trim();
		if (!url) return;
		const idx = this.matchUrls.indexOf(url);
		if (idx !== -1) this.matchUrls.splice(idx, 1);
		if (!target.closest("web-icon")) currentTarget.previousElementSibling.previousElementSibling.value = url;
	}

	addMatchUrls({ code, target }) {
		if (code !== "Enter") return;
		this.matchUrls.push(target.value);
		target.value = "";
	}

	render(pageUrls) {
		const chipItem = (page) =>
			html`<li class="chip-item"><span>${page}</span> <web-icon ico="close" title="remove"></web-icon></li>`;

		return html`<label>
				${i18n("match_url")}
				<a href="https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns">
					${i18n("patterns")}
				</a>
			</label>
			<input
				type="text"
				name="match-urls"
				list="tab-urls"
				title="Press enter for multi"
				@keyup=${this.addMatchUrls.bind(this)} />
			<datalist id="tab-urls">${pageUrls.map((url) => html`<option value="${url}"></option>`)}</datalist>
			<ul class="chip-list" @click=${this.removeMatchUrl.bind(this)}>
				${map(this.matchUrls, chipItem)}
			</ul>`;
	}

	async connectedCallback() {
		const pageUrls = (await chrome.tabs.query({})).map((tab) => tab.url).filter((url) => url);
		this.replaceChildren(this.render(pageUrls));
	}
}

customElements.define("url-filter", UrlFilter);
