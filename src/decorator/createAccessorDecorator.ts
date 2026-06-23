import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "../metadata/defineFieldMetadata";
import type { EsGetterDecorator, EsSetterDecorator, LegacyMethodDecorator } from "./types";

/**
 * 创建兼容多阶段提案的访问器装饰器工厂
 *
 * 生成的装饰器同时支持旧版（Legacy）和 ES 新提案（getter/setter context）两种调用方式，
 * 将元数据键值写入对应字段的元数据中
 *
 * @typeParam This - 目标类实例类型
 * @typeParam Value - 字段值类型
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @returns 兼容多阶段提案的访问器装饰器
 */
export function createAccessorDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsGetterDecorator<This, Value> & EsSetterDecorator<This, Value> & LegacyMethodDecorator<This> {
	return function(target: any, context: any) {
		if(typeof context === "string") {
			defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(target.constructor), context);
		} else {
			defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
		}
	};
}
