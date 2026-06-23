import { ensureMetadata } from "../ensureMetadata";
import { getClass } from "../getClass";
import { defineClassMetadata } from "./defineClassMetadata";
import { defineFieldMetadata } from "./defineFieldMetadata";

/**
 * 定义类级别或字段级别的元数据
 *
 * 根据是否传入 `name` 参数来决定是设置类级别还是字段级别的元数据：
 * - 传入 `name`：设置字段级别的元数据
 * - 不传 `name`：设置类级别的元数据
 *
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 */
export function defineMetadata(metadataKey: string | symbol, metadataValue: any, Class: any, name?: string) {
	if(name) {
		Class = getClass(Class);
		defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(Class), name);
	} else {
		defineClassMetadata(metadataKey, metadataValue, ensureMetadata(Class));
	}
}
