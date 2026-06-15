import type { EsGetterDecorator, EsSetterDecorator, LegacyAccessorDecorator } from "@/decorator/types";
import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";

type ComputedDecorator<This extends object, Value> = EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & LegacyAccessorDecorator<This>;

const Computed: ComputedDecorator<object, any> = function(target: any, context?: any) {
	const metadataKey = 'computed';
	const metadataValue = {};
	if(typeof context === "string") {
		defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(target.constructor), context);
	} else {
		defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
	}
};

export { Computed };

