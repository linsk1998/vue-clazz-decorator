import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 获取指定字段的元数据值（包含继承链）
 *
 * 沿原型链向上查找指定字段的元数据，子类中的元数据优先
 *
 * @param Class - 目标构造函数
 * @param key - 字段名称
 * @returns 包含该字段所有元数据键值的对象
 */
export function getFieldMetadataValue(Class: Function, key: string) {
	let rField = {};
	let Super = Class;
	do {
		let fieldMetadata = fieldWeakMap.get(Super[Symbol.metadata]);
		if(fieldMetadata) {
			if(key in fieldMetadata) {
				let data = fieldMetadata[key];

				let names = Object.getOwnPropertyNames(data);
				let i = names.length;
				while(i--) {
					let name = names[i];
					if(!(name in rField)) {
						rField[name] = data[name];
					}
				}
				let symbols = Object.getOwnPropertySymbols(data);
				let j = symbols.length;
				while(j--) {
					let symbol = symbols[j];
					if(!(symbol in rField)) {
						rField[symbol] = data[symbol];
					}
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return rField;
};

