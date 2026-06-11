import { defineClassMetadata } from "@/metadata/defineClassMetadata";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { ACCESSOR_MAP } from "@/vue/ACCESSOR_MAP";
import { getMetadata } from "../getMetadata";


/** 模型层 */
export function Model<T extends Function>(Class: T, context?: ClassDecoratorContext): T {
	if(context) {
		Class[Symbol.metadata] = context.metadata;
		defineClassMetadata('model', true, context.metadata);
	} else {
		defineClassMetadata('model', true, getMetadata(Class));
	}
	let prototype = Class.prototype;
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
		}
	}
	return Class;
}

