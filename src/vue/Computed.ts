import type { EsGetterDecorator, EsSetterDecorator, LegacyAccessorDecorator } from "@/decorator/types";
import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";
import { computed as $computed } from "vue";


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

function computed<T>(getter: () => T): { get: () => T | null | undefined; };
function computed<T>(getter: () => T, setter: (value: T) => void): { get: () => T | null | undefined; set: (value: T) => void; };
function computed<T>(getter: () => T, setter?: (value: T) => void) {
	if(setter) {
		let _computed = $computed<T>({ get: getter, set: setter });
		return {
			get: function(): T | null | undefined {
				return _computed.value;
			},
			set: function(value: T) {
				_computed.value = value;
			}
		};
	} else {
		let _computed = $computed<T>(getter);
		return {
			get: function(): T | null | undefined {
				return _computed.value;
			}
		};
	}
}
export { computed };
