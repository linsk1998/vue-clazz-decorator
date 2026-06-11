import type { EsAccessorDecorator, EsClassDecorator, EsFieldDecorator, EsGetterDecorator, EsMethodDecorator, EsSetterDecorator, LegacyClassDecorator, LegacyMethodDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { defineClassMetadata } from "../defineClassMetadata";
import { defineFieldMetadata } from "../defineFieldMetadata";

export function metadata<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & EsMethodDecorator<This, any> & EsClassDecorator<This> &
	LegacyMethodDecorator<This> & LegacyPropertyDecorator<This> & LegacyClassDecorator {
	return function(value: any, context?: any) {
		switch(context.kind) {
			case 'class':
				defineClassMetadata(metadataKey, metadataValue, context.metadata);
				break;
			default:
				defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
		}
	};
}
