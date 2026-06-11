import { classWeakMap } from "./defineClassMetadata";

export function getClassMetadataValues(Class: Object): Record<string | symbol, any> {
	let r = Object.create(null);
	let Super = Class;
	do {
		let data = classWeakMap.get(Super[Symbol.metadata]);
		if(data) {
			let names = Object.getOwnPropertyNames(data);
			let i = names.length;
			while(i--) {
				let name = names[i];
				if(!(name in r)) {
					r[name] = data[name];
				}
			}
			let symbols = Object.getOwnPropertySymbols(data);
			let j = symbols.length;
			while(j--) {
				let symbol = symbols[j];
				if(!(symbol in r)) {
					r[symbol] = data[symbol];
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return r;
};
