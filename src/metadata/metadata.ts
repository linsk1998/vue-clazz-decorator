import type { AutoAccessorDecorator, AutoClassDecorator, AutoMethodDecorator, AutoPropertyDecorator } from "../decorator/types";
import { ensureMetadata } from "../ensureMetadata";
import { defineClassMetadata } from "./defineClassMetadata";
import { defineFieldMetadata } from "./defineFieldMetadata";


/**
 * 通用元数据装饰器
 *
 * 自动检测装饰上下文类型（类、字段、方法、访问器），
 * 将元数据键值写入对应的元数据容器中。
 * 同时兼容旧版（Legacy）和 ES 新提案两种装饰器调用方式
 *
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @returns 兼容多阶段提案的通用装饰器
 */
export function metadata<This extends object, Value = any>(metadataKey: string, metadataValue: any): AutoPropertyDecorator<This, Value> & AutoAccessorDecorator<This, Value> & AutoMethodDecorator<This, any> & AutoClassDecorator<This> {
	return function(target: any, context?: any) {
		if(context) {
			if(typeof context === "string") {
				defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(target.constructor), context);
			} else {
				switch(context.kind) {
					case 'class':
						defineClassMetadata(metadataKey, metadataValue, context.metadata);
						break;
					default:
						defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
				}
			}
		} else {
			defineClassMetadata(metadataKey, metadataValue, ensureMetadata(target));
		}
	};
}
