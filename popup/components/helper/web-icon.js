import icons from "/assets/icons.json" assert { type: "json" };

export class WebIcon extends HTMLElement {
	constructor(ico) {
		super();
		ico && this.setAttribute("ico", ico);
	}

	get checked() {
		return this._internals.states.has("--checked");
	}

	set checked(flag) {
		// @ts-ignore
		flag ? this._internals.states.add("--checked") : this._internals.states.delete("--checked");
	}

	set ico(newIcon) {
		this.firstElementChild.innerHTML = icons[newIcon];
	}

	render(path) {
		return `<svg  viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">${icons[path]}</svg>`;
	}

	connectedCallback() {
		this.innerHTML = this.render(this.getAttribute("ico"));
		if (this.hasAttribute("toggle")) {
			this._internals = this.attachInternals();
			this.addEventListener("click", this.#onClick.bind(this));
		}
	}

	#onClick() {
		this.checked = !this.checked;
		this.dispatchEvent(new Event("change"));
	}
}

customElements?.define("web-icon", WebIcon);
