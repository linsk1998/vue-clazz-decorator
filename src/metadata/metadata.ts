import type { AutoAccessorDecorator, AutoClassDecorator, AutoMethodDecorator, AutoPropertyDecorator } from "../decorator/types";
import { ensureMetadata } from "../ensureMetadata";
import { defineClassMetadata } from "./defineClassMetadata";
import { defineFieldMetadata } from "./defineFieldMetadata";


export function metadata<This extends object, Value = any>(metadataKey: string, metadataValue: any): AutoPropertyDecorator<This, Value> & AutoAccessorDecorator<This, Value> & AutoMethodDecorator<This, any> & AutoClassDecorator<This> {
	return function(target: any, context?: any) {
		if(context) {
			if(typeof context === "string") {
				defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(target.constructor), context);
			} else {
				switch(context.kind) {
					case 'class':
						defineClassMetadata(metadataKey, metadataValue, context.metadata);
						break;
					default:
						defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
				}
			}
		} else {
			defineClassMetadata(metadataKey, metadataValue, ensureMetadata(target));
		}
	};
}
