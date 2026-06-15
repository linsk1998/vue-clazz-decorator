import { metadata } from "@/metadata/metadata";
import type { EsAccessorDecorator, EsFieldDecorator, EsGetterDecorator, EsSetterDecorator, LegacyAccessorDecorator, LegacyPropertyDecorator } from "../decorator/types";
import { ensureMetadata } from "../ensureMetadata";
import { defineFieldMetadata, fieldWeakMap } from "../metadata/defineFieldMetadata";

export type NextFunction = (value: any) => any;
export type NextHandleFunction = (value: any, config: any, next: NextFunction) => any;

type FieldDecorator<This extends object = any, Value = any> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & LegacyPropertyDecorator<This> & LegacyAccessorDecorator<This>;

/** 指定 JSON 序列化时的键名 */
export function JsonProperty(jsonKey: string): FieldDecorator<any, any> {
	return metadata('property', jsonKey);
}

/** 控制序列化方向 */
function JsonExpose<This extends object = any, Value = any>(serialize: boolean, deserialize?: boolean): FieldDecorator<This, Value>;
function JsonExpose<This extends object = any, Value = any>(options?: { serialize?: boolean; deserialize?: boolean; }): FieldDecorator<This, Value>;
function JsonExpose<This extends object = any, Value = any>(options?: any): any {
	if(typeof options === "object") {
		if(options) {
			options.serialize = options.serialize !== false;
			options.deserialize = options.deserialize !== false;
		} else {
			options = { serialize: true, deserialize: true };
		}
	} else {
		options = { serialize: options !== false, deserialize: arguments[1] !== false };
	}
	return metadata('expose', options);
}
export { JsonExpose };

/** 忽略属性，序列化和反序列化时都忽略 */
export const JsonIgnore: FieldDecorator<any, any> = metadata('expose', { serialize: true, deserialize: true });

function getOwnMetadata(metadataKey: string | symbol, metadata: any, name: string) {
	var fieldMetadata = fieldWeakMap.get(metadata);
	if(fieldMetadata) {
		var data = fieldMetadata[name];
		if(data) {
			return data[metadataKey];
		}
	}
}

/** 自定义序列化逻辑，多个函数采用洋葱模型叠加执行 */
export function JsonSerialize<This extends object, Value>(fn: NextHandleFunction): FieldDecorator<This, Value> {
	return function(target: any, context: any) {
		var property, metadata;
		if(typeof context === "string") {
			property = context;
			metadata = ensureMetadata(target.constructor);
		} else {
			property = context.name;
			metadata = context.metadata;
		}
		var fns: NextHandleFunction[] = getOwnMetadata('serialize', metadata, property);
		if(!fns) {
			fns = [];
			defineFieldMetadata('serialize', fns, metadata, property);
		}
		fns.push(fn);
	};
}

/** 自定义反序列化逻辑，多个函数采用洋葱模型叠加执行 */
export function JsonDeserialize<This extends object, Value>(fn: NextHandleFunction): FieldDecorator<This, Value> {
	return function(target: any, context: any) {
		return function(target: any, context: any) {
			var property, metadata;
			if(typeof context === "string") {
				property = context;
				metadata = ensureMetadata(target.constructor);
			} else {
				property = context.name;
				metadata = context.metadata;
			}
			var fns: NextHandleFunction[] = getOwnMetadata('deserialize', metadata, property);
			if(!fns) {
				fns = [];
				defineFieldMetadata('deserialize', fns, metadata, property);
			}
			fns.push(fn);
		};
	};
}
