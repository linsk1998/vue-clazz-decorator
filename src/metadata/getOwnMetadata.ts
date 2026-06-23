import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 获取自身元数据值（不包含继承链）
 *
 * 仅查找目标类自身的元数据，不会沿原型链向上查找。
 * 根据是否传入 `name` 参数来获取类级别或字段级别的元数据
 *
 * @param metadataKey - 元数据键名
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 元数据值，未找到则返回 `undefined`
 */
export function getOwnMetadata(metadataKey: string | symbol, Class: Object, name?: string) {
	if(name) {
		Class = getClass(Class);
		if(Object.hasOwn(Class, Symbol.metadata)) {
			let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
			if(fieldMetadata) {
				let data = fieldMetadata[name];
				if(data) {
					return data[metadataKey];
				}
			}
		}
	} else {
		if(Object.hasOwn(Class, Symbol.metadata)) {
			let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
			if(classMetadata) {
				return classMetadata[metadataKey];
			}
		}
	}
}
