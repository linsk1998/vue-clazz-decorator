import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 判断是否存在指定元数据键（包含继承链）
 *
 * 根据是否传入 `name` 参数来检查类级别或字段级别的元数据。
 * 沿原型链向上查找，只要任一父类存在该键即返回 `true`
 *
 * @param metadataKey - 元数据键名
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 是否存在该元数据键
 */
export function hasMetadata(metadataKey: string | symbol, Class: Object, name?: string): boolean {
	if(name) {
		Class = getClass(Class);
		return hasFieldMetadata(metadataKey, Class, name);
	} else {
		return hasClassMetadata(metadataKey, Class);
	}
}

function hasClassMetadata(metadataKey: string | symbol, Class: Object) {
	let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
	if(classMetadata) {
		return metadataKey in classMetadata;
	}
	var Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return hasClassMetadata(metadataKey, Super);
	}
	return false;
}

function hasFieldMetadata(metadataKey: string | symbol, Class: Object, name: string) {
	let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
	if(fieldMetadata) {
		let data = fieldMetadata[name];
		if(data) {
			return metadataKey in data;
		}
	}
	var Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return hasFieldMetadata(metadataKey, Super, name);
	}
	return false;
}
