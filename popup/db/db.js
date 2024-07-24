export const Store = {
	HeaderRules: "HeaderRules",
};

function onupgradeneeded({ target }) {
	target.result.createObjectStore(Store.HeaderRules, { keyPath: "id" });
}

/**@returns {Promise<IDBDatabase>} */
export function connect() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("fixHeader", 1);
		request.onupgradeneeded = onupgradeneeded;
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => console.warn("Pending until unblocked");
	});
}
