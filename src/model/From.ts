import { ensureMetadata } from "@/ensureMetadata";
import { fieldWeakMap } from "@/metadata/defineFieldMetadata";
import type { AutoPropertyDecorator } from "../decorator/types";

/** 引用另一个 Model 的某个字段的元数据配置 */
export function From<This extends object = any, Value = any>(SourceClass: Function, sourceField: string): AutoPropertyDecorator<This, Value> {
	return function(target: any, context: any) {
		var property: string, metadata: object;
		if(typeof context === "string") {
			property = context;
			metadata = ensureMetadata(target.constructor);
		} else {
			property = context.name;
			metadata = context.metadata;
		}
		let fieldMetadata = fieldWeakMap.get(metadata);
		if(!fieldMetadata) {
			fieldMetadata = {};
			fieldWeakMap.set(metadata, fieldMetadata);
		}
		let data = fieldMetadata[property];
		if(!data) {
			data = fieldMetadata[property] = Object.create(null);
		}
		let Super = SourceClass;
		do {
			let superFieldMeta = fieldWeakMap.get(Super[Symbol.metadata]);
			if(superFieldMeta && sourceField in superFieldMeta) {
				let sourceData = superFieldMeta[sourceField];
				let names = Object.getOwnPropertyNames(sourceData);
				let i = names.length;
				while(i--) {
					let name = names[i];
					if(!(name in data)) {
						data[name] = sourceData[name];
					}
				}
				let symbols = Object.getOwnPropertySymbols(sourceData);
				let j = symbols.length;
				while(j--) {
					let symbol = symbols[j];
					if(!(symbol in data)) {
						data[symbol] = sourceData[symbol];
					}
				}
			}
			Super = Object.getPrototypeOf(Super);
		} while(Super && Super !== Function.prototype);
	};
}

