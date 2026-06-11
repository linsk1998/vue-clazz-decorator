import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function deleteMetadata(metadataKey: string | symbol, Class: Object, name?: string) {
	if(name) {
		Class = getClass(Class);
		let meta = Class[Symbol.metadata];
		if(meta) {
			let fieldMetadata = fieldWeakMap.get(meta);
			if(fieldMetadata) {
				let data = fieldMetadata[name];
				if(data) {
					if(Object.hasOwn(data, metadataKey)) {
						delete data[metadataKey];
						return true;
					}
				}
			}
		}
	} else {
		let meta = Class[Symbol.metadata];
		if(meta) {
			let classMetadata = classWeakMap.get(meta);
			if(classMetadata) {
				if(Object.hasOwn(classMetadata, metadataKey)) {
					delete classMetadata[metadataKey];
					return true;
				}
			}
		}
	}
	return false;
}
