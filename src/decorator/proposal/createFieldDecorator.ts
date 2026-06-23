import { defineFieldMetadata } from "../../metadata/defineFieldMetadata";
import type { EsAccessorDecorator, EsFieldDecorator } from "../types";

/**
 * 创建 ES 新提案阶段字段装饰器工厂
 *
 * 使用 `ClassFieldDecoratorContext` / `ClassAccessorDecoratorContext` 上下文，
 * 将元数据键值写入对应字段的元数据中
 *
 * @typeParam This - 目标类实例类型
 * @typeParam Value - 字段值类型
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @returns ES 新提案字段装饰器
 */
export function createFieldDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> {
	return function(target: any, context: any) {
		defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
	};
}
