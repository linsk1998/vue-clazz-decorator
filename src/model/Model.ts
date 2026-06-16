import { defineClassMetadata } from "@/metadata/defineClassMetadata";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { ACCESSOR_MAP } from "@/vue/ACCESSOR_MAP";
import { DEFAULT_MAP } from "@/vue/DEFAULT_MAP";
import { ensureMetadata } from "../ensureMetadata";
import { applyOnionSerialize } from "./serialize";

interface ClassWithInitializer<T> {
	new(init?: Record<keyof T, any>): T;
}

/** 模型层 */
export function Model<T extends object>(Class: ClassWithInitializer<T>, context?: ClassDecoratorContext<ClassWithInitializer<T>>): ClassWithInitializer<T> {
	if(context) {
		Class[Symbol.metadata] = context.metadata;
		defineClassMetadata('model', true, context.metadata);
	} else {
		defineClassMetadata('model', true, ensureMetadata(Class));
	}
	let prototype = Class.prototype;
	let metadata = getFieldMetadataValues(Class);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		// @Type 字段：赋值时自动转为类型化实例
		let Class = fieldConfig.type;
		if(!Class) {
			Class = fieldConfig['design:type'];
			if(Class) fieldConfig.type = Class;
		}
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
		} else if('state' in fieldConfig || 'reactive' in fieldConfig || Class) {
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
	// 注入 toJSON 方法
	if(!prototype.toJSON) {
		prototype.toJSON = function() {
			let result: Record<string, any> = {};
			let metadata = getFieldMetadataValues(this.constructor);
			// 遍历所有自有可枚举属性 + 有元数据的字段
			let allKeys = new Set<string>([...Object.keys(this), ...Object.keys(metadata)]);
			allKeys.forEach(key => {
				let value = this[key];
				let fieldConfig = metadata[key];
				// 无元数据的字段, 直接复制
				if(!fieldConfig) {
					result[key] = value;
					return;
				}
				// 跳过禁止序列化的字段
				let expose = fieldConfig.expose;
				if(expose && expose.serialize === false) return;
				let property = fieldConfig.property || key;
				// 应用自定义序列化
				result[property] = applyOnionSerialize(value, fieldConfig);
			});
			return result;
		};
	}
	return Class;
}
