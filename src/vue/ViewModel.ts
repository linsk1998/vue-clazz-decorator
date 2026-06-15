import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { ACCESSOR_MAP } from "./ACCESSOR_MAP";
import { DEFAULT_MAP } from "./DEFAULT_MAP";


export function ViewModel<T extends Function>(Class: T, context?: ClassDecoratorContext): T {
	let prototype = Class.prototype;
	if(context) Class[Symbol.metadata] = context.metadata;
	let metadata = getFieldMetadataValues(Class);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		if('computed' in fieldConfig) {
			let desc = Object.getOwnPropertyDescriptor(prototype, key);
			if(process.env.NODE_ENV !== 'production') {
				if(!desc) {
					console.error(`ViewModel: ${key} is a computed, but it does not exist`);
				} else if(!desc.get) {
					console.error(`ViewModel: ${key} is a computed, but it does not have get`);
				}
			}
			Object.assign(fieldConfig.computed, desc);
			Object.defineProperty(prototype, key, {
				configurable: true,
				enumerable: true,
				get() {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[key].get();
				},
				set(value) {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[key].set(value);
				}
			});
			if(process.env.NODE_ENV !== 'production') {
				if('ref' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a computed, but it has ref`);
				}
				if('modelValue' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a computed, but it has modelValue`);
				}
				if('state' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a computed, but it has state`);
				}
				if('prop' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a computed, but it has prop`);
				}
				if('inject' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a computed, but it has inject`);
				}
			}
		} else if('ref' in fieldConfig) {
			Object.defineProperty(prototype, key, {
				configurable: true,
				enumerable: true,
				get() {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors?.[key].get();
				}
			});
			if(process.env.NODE_ENV !== 'production') {
				if('modelValue' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a ref, but it has modelValue`);
				}
				if('state' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a ref, but it has state`);
				}
				if('prop' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a ref, but it has prop`);
				}
				if('inject' in fieldConfig) {
					console.warn(`ViewModel: ${key} is a ref, but it has inject`);
				}
			}
		} else if('modelValue' in fieldConfig || 'state' in fieldConfig || 'prop' in fieldConfig || 'inject' in fieldConfig) {
			Object.defineProperty(prototype, key, {
				configurable: true,
				enumerable: true,
				get() {
					var accessors = ACCESSOR_MAP.get(this);
					if(accessors) {
						return accessors[key].get();
					}
					var defaults = DEFAULT_MAP.get(this);
					if(defaults) {
						return defaults[key];
					}
					return undefined;
				},
				set(value) {
					var accessors = ACCESSOR_MAP.get(this);
					if(accessors) {
						accessors[key].set(value);
					} else {
						let defaults = DEFAULT_MAP.get(this);
						if(!defaults) {
							defaults = {};
							DEFAULT_MAP.set(this, defaults);
						}
						defaults[key] = value;
					}
				}
			});
		}
	}
	return Class;
}
