import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

export function getOwnMetadata(metadataKey: string | symbol, Class: Object, name?: string) {
	if(name) {
		Class = getClass(Class);
		if(Object.hasOwn(Class, Symbol.metadata)) {
			var fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
			if(fieldMetadata) {
				var data = fieldMetadata[name];
				if(data) {
					return data[metadataKey];
				}
			}
		}
	} else {
		if(Object.hasOwn(Class, Symbol.metadata)) {
			var classMetadata = classWeakMap.get(Class[Symbol.metadata]);
			if(classMetadata) {
				return classMetadata[metadataKey];
			}
		}
	}
}
