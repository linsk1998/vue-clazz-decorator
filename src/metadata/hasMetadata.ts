import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function hasMetadata(metadataKey: string | symbol, Class: Object, name?: string): boolean {
	if(name) {
		Class = getClass(Class);
		return hasFieldMetadata(metadataKey, Class, name);
	} else {
		return hasClassMetadata(metadataKey, Class);
	}
}

function hasClassMetadata(metadataKey: string | symbol, Class: Object) {
	let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
	if(classMetadata) {
		return metadataKey in classMetadata;
	}
	var Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return hasClassMetadata(metadataKey, Super);
	}
	return false;
}

function hasFieldMetadata(metadataKey: string | symbol, Class: Object, name: string) {
	let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
	if(fieldMetadata) {
		let data = fieldMetadata[name];
		if(data) {
			return metadataKey in data;
		}
	}
	var Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return hasFieldMetadata(metadataKey, Super, name);
	}
	return false;
}
