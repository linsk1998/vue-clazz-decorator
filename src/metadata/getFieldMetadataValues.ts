import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 获取所有字段的元数据值（包含继承链）
 *
 * 沿原型链向上收集所有字段级别的元数据，子类元数据优先
 *
 * @param Class - 目标构造函数
 * @returns 键为字段名、值为该字段元数据映射的对象
 */
export function getFieldMetadataValues(Class: Function) {
	let r = {};
	let Super = Class;
	do {
		let fieldMetadata = fieldWeakMap.get(Super[Symbol.metadata]);
		if(fieldMetadata) {
			for(let key in fieldMetadata) {
				let rField = r[key];
				if(!rField) {
					rField = Object.create(null);
					r[key] = rField;
				}
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
	return r;
};

