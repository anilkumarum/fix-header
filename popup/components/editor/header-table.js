import { requestHeaderData } from "../../js/constant.js";
import { Header } from "../../db/HeaderRule.js";
import { html } from "../../js/om.compact.js";

export class HeaderTable extends HTMLElement {
	constructor(headers, headerType) {
		super();
		this.headers = headers;
		this.headerType = headerType;
	}

	insertDataList(headerKey) {
		const dataList = requestHeaderData[headerKey];
		if (!dataList || $("#" + headerKey, this)) return;
		const dataListElem = `<datalist id="${headerKey}">
			${dataList.map((url) => `<option value="${url}"></option>`)}
		</datalist>`;
		this.insertAdjacentHTML("beforeend", dataListElem);
	}

	onRowClick({ target }) {
		if (!target.closest('web-icon[ico="delete"]')) return;
		const rowElem = target.closest("tr");
		rowElem.remove();
		this.headers.splice(rowElem.rowIndex - 1, 1);
	}

	onPaste(evt) {
		if (!evt.target.name) return;
		if (evt.target.name !== "key") return;
		const pasteText = evt.clipboardData.getData("text");
		if (pasteText.includes(": ")) {
			const [key, value] = pasteText.split(": ");
			evt.target.value = key.trim();
			evt.target.parentElement.nextElementSibling.firstElementChild.value = value.trim();
			evt.preventDefault();
		}
	}

	onInputChange({ target }) {
		if (!target.name) return;
		const rowElem = target.closest("tr");

		this.headers[rowElem.rowIndex - 1] ??= new Header();
		this.headers[rowElem.rowIndex - 1][target.name] = target.type === "checkbox" ? target.check : target.value;
		if (target.name !== "key") return;

		const headerKey = target.value;
		const valueInput = rowElem.cells[3].firstElementChild;
		valueInput.setAttribute("list", headerKey);
		this.insertDataList(headerKey);
		rowElem.nextElementSibling || rowElem.insertAdjacentHTML("afterend", this.headerItem());
	}

	headerItem = (header) => `<tr>
		<td><input type="checkbox" name="enable" checked /></td>
		<td>
			<select name="operation" value="${header?.operation}">
				<option value="set">Override</option>
				<option value="append">Add</option>
				<option value="remove">Remove</option>
			</select>
		</td>
		<td>
			<input
				type="text"
				name="key"
				list="${this.headerType}-headers"
				placeholder="key"
				value="${header?.key ?? ""}" />
		</td>
		<td><input type="text" name="value" placeholder="value" value="${header?.value ?? ""}" /></td>
		<td><web-icon ico="delete" title=""></web-icon></td>
	</tr>`;

	render() {
		return html`<table>
			<thead>
				<tr>
					<th></th>
					<th>${i18n("action")}</th>
					<th>${i18n("key")}</th>
					<th>${i18n("value")}</th>
					<th></th>
				</tr>
			</thead>
			<tbody
				@change=${this.onInputChange.bind(this)}
				@paste=${this.onPaste.bind(this)}
				@click=${this.onRowClick.bind(this)}>
				${this.headers.map(this.headerItem)} ${this.headerItem()}
			</tbody>
		</table> `;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("header-table", HeaderTable);
