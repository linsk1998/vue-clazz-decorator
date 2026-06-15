import { ensureMetadata } from "../ensureMetadata";
import { getClass } from "../getClass";
import { defineClassMetadata } from "./defineClassMetadata";
import { defineFieldMetadata } from "./defineFieldMetadata";

export function defineMetadata(metadataKey: string | symbol, metadataValue: any, Class: any, name?: string) {
	if(name) {
		Class = getClass(Class);
		defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(Class), name);
	} else {
		defineClassMetadata(metadataKey, metadataValue, ensureMetadata(Class));
	}
}
