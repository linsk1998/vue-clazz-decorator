import type { EsAccessorDecorator, EsClassDecorator, EsFieldDecorator, EsGetterDecorator, EsMethodDecorator, EsSetterDecorator, LegacyClassDecorator, LegacyMethodDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { getClass } from "../../getClass";
import { defineMetadata } from "../defineMetadata";

export function metadata<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & EsMethodDecorator<This, any> & EsClassDecorator<This> &
	LegacyMethodDecorator<This> & LegacyPropertyDecorator<This> & LegacyClassDecorator {
	return function(target: any, prop: any) {
		if(prop) {
			defineMetadata(
				metadataKey,
				metadataValue,
				getClass(target),
				prop
			);
		} else {
			defineMetadata(metadataKey, metadataValue, target);
		}
	} as any;
}
