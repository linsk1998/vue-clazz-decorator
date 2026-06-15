import { ensureMetadata } from "@/ensureMetadata";
import { fieldWeakMap } from "@/metadata/defineFieldMetadata";
import type { EsAccessorDecorator, EsFieldDecorator, EsGetterDecorator, EsSetterDecorator, LegacyPropertyDecorator } from "../decorator/types";

type FieldDecorator<This extends object = any, Value = any> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & LegacyPropertyDecorator<This>;

/** 引用另一个 Model 的某个字段的元数据配置 */
export function From<This extends object = any, Value = any>(SourceClass: Function, sourceField: string): FieldDecorator<This, Value> {
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
			let fieldMetadata = fieldWeakMap.get(Super[Symbol.metadata]);
			if(fieldMetadata) {
				if(sourceField in fieldMetadata) {
					let data = fieldMetadata[sourceField];

					let names = Object.getOwnPropertyNames(data);
					let i = names.length;
					while(i--) {
						let name = names[i];
						if(!(name in data)) {
							data[name] = data[name];
						}
					}
					let symbols = Object.getOwnPropertySymbols(data);
					let j = symbols.length;
					while(j--) {
						let symbol = symbols[j];
						if(!(symbol in data)) {
							data[symbol] = data[symbol];
						}
					}
				}
			}
			Super = Object.getPrototypeOf(Super);
		} while(Super && Super !== Function.prototype);
	};
}

