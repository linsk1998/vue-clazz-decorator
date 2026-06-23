import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";
import type { AutoAccessorDecorator } from "../decorator/types";


type ComputedDecorator<This extends object, Value> = AutoAccessorDecorator<This, Value>;

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

