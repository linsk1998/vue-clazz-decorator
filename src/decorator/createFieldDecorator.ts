import { getMetadata } from "@/getMetadata";
import { defineFieldMetadata } from "../metadata/defineFieldMetadata";
import type { EsAccessorDecorator, EsFieldDecorator, LegacyPropertyDecorator } from "./types";



export function createFieldDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> {
	return function(target: any, context?: any) {
		if(typeof context === "string") {
			defineFieldMetadata(metadataKey, metadataValue, getMetadata(target.constructor), context);
		} else {
			defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
		}
	};
}
