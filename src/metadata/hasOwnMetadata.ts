import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function hasOwnMetadata(metadataKey: string | symbol, Class: Object, name?: string): boolean {
	if(name) {
		Class = getClass(Class);
		let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
		if(fieldMetadata) {
			let data = fieldMetadata[name];
			if(data) {
				return Object.hasOwn(data, metadataKey);
			}
			return false;
		}
	} else {
		let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
		if(classMetadata) {
			return Object.hasOwn(classMetadata, metadataKey);
		}
	}
	return null;
}
