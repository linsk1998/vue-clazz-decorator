import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function getMetadataKeys(Class: Object, name?: string): Array<string | symbol> {
	if(name) {
		Class = getClass(Class);
		return getFieldMetadataKeys(Class, name);
	} else {
		return getClassMetadataKeys(Class);
	}
}

function getClassMetadataKeys(Class: Object) {
	let r = [];
	let Super = Class;
	do {
		let data = classWeakMap.get(Super[Symbol.metadata]);
		if(data) {
			let names = Object.getOwnPropertyNames(data);
			let i = names.length;
			while(i--) {
				let name = names[i];
				if(!r.includes(name)) {
					r.push(name);
				}
			}
			let symbols = Object.getOwnPropertySymbols(data);
			let j = symbols.length;
			while(j--) {
				let symbol = symbols[j];
				if(!r.includes(symbol)) {
					r.push(symbol);
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return r;
}

function getFieldMetadataKeys(Class: Object, name: string) {
	let rKeys = [];
	let Super = Class;
	do {
		let fieldMetadata = fieldWeakMap.get(Super[Symbol.metadata]);
		if(fieldMetadata) {
			if(name in fieldMetadata) {
				let data = fieldMetadata[name];
				let names = Object.getOwnPropertyNames(data);
				let i = names.length;
				while(i--) {
					let name = names[i];
					if(!rKeys.includes(name)) {
						rKeys.push(name);
					}
				}
				let symbols = Object.getOwnPropertySymbols(data);
				let j = symbols.length;
				while(j--) {
					let symbol = symbols[j];
					if(!rKeys.includes(symbol)) {
						rKeys.push(symbol);
					}
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return rKeys;
}
