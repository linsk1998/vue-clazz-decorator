import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 获取所有元数据键名（包含继承链）
 *
 * 根据是否传入 `name` 参数来获取类级别或字段级别的所有元数据键名。
 * 沿原型链向上收集，去重
 *
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 元数据键名数组
 */
export function getMetadataKeys(Class: Object, name?: string): Array<string | symbol> {
	if(name) {
		Class = getClass(Class);
		return getFieldMetadataKeys(Class, name);
	} else {
		return getClassMetadataKeys(Class);
	}
}

function getClassMetadataKeys(Class: Object) {
	let r = [];
	let Super = Class;
	do {
		let data = classWeakMap.get(Super[Symbol.metadata]);
		if(data) {
			let names = Object.getOwnPropertyNames(data);
			let i = names.length;
			while(i--) {
				let name = names[i];
				if(!r.includes(name)) {
					r.push(name);
				}
			}
			let symbols = Object.getOwnPropertySymbols(data);
			let j = symbols.length;
			while(j--) {
				let symbol = symbols[j];
				if(!r.includes(symbol)) {
					r.push(symbol);
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return r;
}

function getFieldMetadataKeys(Class: Object, name: string) {
	let rKeys = [];
	let Super = Class;
	do {
		let fieldMetadata = fieldWeakMap.get(Super[Symbol.metadata]);
		if(fieldMetadata) {
			if(name in fieldMetadata) {
				let data = fieldMetadata[name];
				let names = Object.getOwnPropertyNames(data);
				let i = names.length;
				while(i--) {
					let name = names[i];
					if(!rKeys.includes(name)) {
						rKeys.push(name);
					}
				}
				let symbols = Object.getOwnPropertySymbols(data);
				let j = symbols.length;
				while(j--) {
					let symbol = symbols[j];
					if(!rKeys.includes(symbol)) {
						rKeys.push(symbol);
					}
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return rKeys;
}
