import { HeaderRule } from "./HeaderRule.js";
import { connect, Store } from "./db.js";

/**@returns {Promise<HeaderRule[]>} */
export async function getAllHeaderRules() {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.HeaderRules, "readonly").objectStore(Store.HeaderRules);
			const fetchQuery = store.getAll();
			fetchQuery.onsuccess = ({ target }) => resolve(target["result"]);
			fetchQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/**@param {HeaderRule} headerRule*/
export async function saveHeaderRuleInDb(headerRule) {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.HeaderRules, "readwrite").objectStore(Store.HeaderRules);
			const insertTask = store.put(headerRule);
			insertTask.onsuccess = (e) => resolve(headerRule);
			insertTask.onerror = (e) => reject(e);
			db.close();
		});
	});
}

/**@param {HeaderRule[]} headerRules*/
export async function insertMultiHeaderRuleInDb(headerRules) {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const transaction = db.transaction(Store.HeaderRules, "readwrite");
			const store = transaction.objectStore(Store.HeaderRules);
			for (const headerRule of headerRules) store.put(headerRule);
			transaction.oncomplete = (e) => resolve(e.target["result"]);
			transaction.onerror = (e) => reject(e);
			db.close();
		});
	});
}

export async function updateHeaderRuleInDb(id, key, value) {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.HeaderRules, "readwrite").objectStore(Store.HeaderRules);
			const fetchQuery = store.get(id);
			fetchQuery.onsuccess = ({ target }) => {
				const headerRule = target["result"];
				headerRule[key] = value;
				headerRule.lastModifiedAt = Date.now();
				const insertTask = store.put(headerRule);
				insertTask.onsuccess = (evt) => resolve(target["result"]);
				insertTask.onerror = (e) => reject(e);
			};
			fetchQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}

export async function deleteHeaderRuleInDb(id) {
	return new Promise((resolve, reject) => {
		connect().then((db) => {
			const store = db.transaction(Store.HeaderRules, "readwrite").objectStore(Store.HeaderRules);
			const deleteQuery = store.delete(id);
			deleteQuery.onsuccess = ({ target }) => resolve(target["result"]);
			deleteQuery.onerror = (e) => reject(e);
			db.close();
		});
	});
}
