import { defineClassMetadata } from "@/metadata/defineClassMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { ACCESSOR_MAP } from "@/vue/ACCESSOR_MAP";
import { DEFAULT_MAP } from "@/vue/DEFAULT_MAP";
import type { ModelClassWithInitializer } from "@/vue/Reactive";
import { ensureMetadata } from "../ensureMetadata";
import { applyOnionSerialize } from "./serialize";


/**
 * 模型类装饰器
 *
 * 标记一个类为数据模型，为其注入属性访问器（基于元数据配置的 getter/setter）、
 * `toJSON()` 序列化方法等能力。支持 `@Type`、`@Computed`、`@State` 等字段装饰器配合使用。
 * 同时支持旧版（Legacy）和 ES 新提案装饰器调用方式
 *
 * @param Class - 目标模型类
 * @param context - ES 新提案的类装饰器上下文（可选，Legacy 模式下不存在）
 * @returns 增强后的模型类
 */
export function Model<T extends object>(Class: ModelClassWithInitializer<T>, context?: ClassDecoratorContext<ModelClassWithInitializer<T>>): ModelClassWithInitializer<T> {
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
		let Type = fieldConfig.type;
		if(!Type) {
			Type = fieldConfig['design:type'];
			if(Type) {
				defineFieldMetadata('type', Type, Class[Symbol.metadata], key);
			}
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
		} else if('state' in fieldConfig || 'reactive' in fieldConfig || Type) {
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
		} else {
			if(!(key in prototype)) {
				prototype[key] = undefined;
			}
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
