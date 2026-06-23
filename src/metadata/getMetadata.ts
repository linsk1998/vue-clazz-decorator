import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 获取元数据值（包含继承链）
 *
 * 根据是否传入 `name` 参数来获取类级别或字段级别的元数据。
 * 如果当前类没有找到对应元数据，会沿原型链向上查找
 *
 * @param metadataKey - 元数据键名
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 元数据值，未找到则返回 `undefined`
 */
export function getMetadata(metadataKey: string | symbol, Class: Object, name?: string): any {
	if(name) {
		Class = getClass(Class);
		return getFieldMetadata(metadataKey, Class, name);
	} else {
		return getClassMetadata(metadataKey, Class);
	}
}

function getClassMetadata(metadataKey: string | symbol, Class: Object) {
	let classMetadata = classWeakMap.get(Class[Symbol.metadata]);
	if(classMetadata) {
		if(metadataKey in classMetadata) {
			return classMetadata[metadataKey];
		}
	}
	let Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return getClassMetadata(metadataKey, Super);
	}
}

function getFieldMetadata(metadataKey: string | symbol, Class: Object, name: string) {
	let fieldMetadata = fieldWeakMap.get(Class[Symbol.metadata]);
	if(fieldMetadata) {
		let data = fieldMetadata[name];
		if(data) {
			if(metadataKey in data) {
				return data[metadataKey];
			}
		}
	}
	let Super = Object.getPrototypeOf(Class);
	if(Super && Super !== Function.prototype) {
		return getFieldMetadata(metadataKey, Super, name);
	}
}
