import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function getOwnMetadataKeys(Class: Object, name?: string): string[] {
	if(name) {
		Class = getClass(Class);
		let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
		if(fieldMetadata) {
			let data = fieldMetadata[name];
			if(data) {
				return Object.keys(data);
			}
		}
	} else {
		let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
		if(classMetadata) {
			return Object.keys(classMetadata);
		}
	}
	return [];
}
