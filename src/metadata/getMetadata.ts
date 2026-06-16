import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function getMetadata(metadataKey: string | symbol, Class: Object, name?: string): any {
	if(name) {
		Class = getClass(Class);
		return getFieldMetadata(metadataKey, Class, name);
	} else {
		return getClassMetadata(metadataKey, Class);
	}
}

function getClassMetadata(metadataKey: string | symbol, Class: Object) {
	let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
	if(classMetadata) {
		if(metadataKey in classMetadata) {
			return classMetadata[metadataKey];
		}
	}
	let Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return getClassMetadata(metadataKey, Super);
	}
}

function getFieldMetadata(metadataKey: string | symbol, Class: Object, name: string) {
	let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
	if(fieldMetadata) {
		let data = fieldMetadata[name];
		if(data) {
			if(metadataKey in data) {
				return data[metadataKey];
			}
		}
	}
	let Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return getFieldMetadata(metadataKey, Super, name);
	}
}
