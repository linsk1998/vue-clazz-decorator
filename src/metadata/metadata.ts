import type { EsAccessorDecorator, EsClassDecorator, EsFieldDecorator, EsGetterDecorator, EsMethodDecorator, EsSetterDecorator, LegacyClassDecorator, LegacyMethodDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { getMetadata } from "../getMetadata";
import { defineClassMetadata } from "./defineClassMetadata";
import { defineFieldMetadata } from "./defineFieldMetadata";


export function metadata<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & EsMethodDecorator<This, any> & EsClassDecorator<This> &
	LegacyMethodDecorator<This> & LegacyPropertyDecorator<This> & LegacyClassDecorator {
	return function(target: any, context?: any) {
		if(context) {
			if(typeof context === "string") {
				defineFieldMetadata(metadataKey, metadataValue, getMetadata(target.constructor), context);
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
			defineClassMetadata(metadataKey, metadataValue, getMetadata(target));
		}
	};
}
