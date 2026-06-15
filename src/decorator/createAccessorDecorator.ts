import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "../metadata/defineFieldMetadata";
import type { EsGetterDecorator, EsSetterDecorator, LegacyMethodDecorator } from "./types";



export function createAccessorDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & LegacyMethodDecorator<This> {
	return function(target: any, context: any) {
		if(typeof context === "string") {
			defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(target.constructor), context);
		} else {
			defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
		}
	};
}
