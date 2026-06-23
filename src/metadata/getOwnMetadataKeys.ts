import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 获取自身所有元数据键名（不包含继承链）
 *
 * 仅查找目标类自身的元数据键名，不会沿原型链向上查找。
 * 根据是否传入 `name` 参数来获取类级别或字段级别的元数据键名
 *
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 元数据键名数组
 */
export function getOwnMetadataKeys(Class: Object, name?: string): string[] {
	if(name) {
		Class = getClass(Class);
		let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
		if(fieldMetadata) {
			let data = fieldMetadata[name];
			if(data) {
				return Object.keys(data);
			}
		}
	} else {
		let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
		if(classMetadata) {
			return Object.keys(classMetadata);
		}
	}
	return [];
}
