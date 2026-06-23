import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 判断自身是否存在指定元数据键（不包含继承链）
 *
 * 仅检查目标类自身的元数据，不会沿原型链向上查找。
 * 根据是否传入 `name` 参数来检查类级别或字段级别的元数据
 *
 * @param metadataKey - 元数据键名
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 是否存在该元数据键，不存在则返回 `null`
 */
export function hasOwnMetadata(metadataKey: string | symbol, Class: Object, name?: string): boolean {
	if(name) {
		Class = getClass(Class);
		let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
		if(fieldMetadata) {
			let data = fieldMetadata[name];
			if(data) {
				return Object.hasOwn(data, metadataKey);
			}
			return false;
		}
	} else {
		let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
		if(classMetadata) {
			return Object.hasOwn(classMetadata, metadataKey);
		}
	}
	return null;
}
