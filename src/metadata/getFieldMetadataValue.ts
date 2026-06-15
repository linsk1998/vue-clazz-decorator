import { fieldWeakMap } from "./defineFieldMetadata";

export function getFieldMetadataValue(Class: Function, key: string) {
	let rField = {};
	let Super = Class;
	do {
		let fieldMetadata = fieldWeakMap.get(Super[Symbol.metadata]);
		if(fieldMetadata) {
			if(key in fieldMetadata) {
				let data = fieldMetadata[key];

				let names = Object.getOwnPropertyNames(data);
				let i = names.length;
				while(i--) {
					let name = names[i];
					if(!(name in rField)) {
						rField[name] = data[name];
					}
				}
				let symbols = Object.getOwnPropertySymbols(data);
				let j = symbols.length;
				while(j--) {
					let symbol = symbols[j];
					if(!(symbol in rField)) {
						rField[symbol] = data[symbol];
					}
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return rField;
};

