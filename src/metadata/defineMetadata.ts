import { getClass } from "../getClass";
import { getMetadata } from "../getMetadata";
import { defineClassMetadata } from "./defineClassMetadata";
import { defineFieldMetadata } from "./defineFieldMetadata";

export function defineMetadata(metadataKey: string | symbol, metadataValue: any, Class: any, name?: string) {
	if(name) {
		Class = getClass(Class);
		defineFieldMetadata(metadataKey, metadataValue, getMetadata(Class), name);
	} else {
		defineClassMetadata(metadataKey, metadataValue, getMetadata(Class));
	}
}
