import { enumPropKeys } from "../../js/constant.js";
import { html, map } from "../../js/om.compact.js";

export class DatalistInput extends HTMLElement {
	/** @param {string} label @param {string[]} dataList @param {string[]} selectedList*/
	constructor(label, dataList, selectedList) {
		super();
		this.label = label;
		this.dataList = dataList;
		this.selectedList = selectedList;
	}

	removeItem({ currentTarget, target }) {
		const page = target.closest("li").textContent.trim();
		const idx = this.selectedList.indexOf(page);
		if (idx !== -1) this.selectedList.splice(idx, 1);
		if (!target.closest("web-icon")) currentTarget.previousElementSibling.previousElementSibling.value = page;
	}

	addItem({ code, target }) {
		if (code !== "Enter") return;
		if (this.dataList.indexOf(target.value) === -1 && enumPropKeys.has(this.label))
			return notify("Invalid input value", "error");
		this.selectedList.push(target.value);
		target.value = "";
	}

	render() {
		const listId = this.label.replaceAll(" ", "-");
		const chipItem = (page) =>
			html`<li class="chip-item"><span>${page}</span> <web-icon ico="close" title="remove"></web-icon></li>`;

		return html`<label> <input type="checkbox" checked disabled /> ${this.label}</label>
			<input type="url" name="matches" list="${listId}" @keyup=${this.addItem.bind(this)} />
			<datalist id="${listId}">${this.dataList.map((url) => html`<option value="${url}"></option>`)}</datalist>
			<ul class="chip-list" @click=${this.removeItem.bind(this)}>
				${map(this.selectedList, chipItem)}
			</ul>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("datalist-input", DatalistInput);
