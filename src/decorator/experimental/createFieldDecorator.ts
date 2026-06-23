import { defineFieldMetadata } from "../../metadata/defineFieldMetadata";
import type { LegacyPropertyDecorator } from "../types";

/**
 * 创建旧版（Legacy）字段装饰器工厂（实验性阶段）
 *
 * 仅支持 TypeScript experimentalDecorators 模式，
 * 将元数据键值写入对应字段的元数据中
 *
 * @typeParam This - 目标类实例类型
 * @typeParam Value - 字段值类型
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @returns 旧版字段装饰器
 */
export function createFieldDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): LegacyPropertyDecorator<This> {
	return function(target: any, context: any) {
		defineFieldMetadata(metadataKey, metadataValue, target.constructor, context);
	};
}
