import { classWeakMap } from "./defineClassMetadata";

/**
 * 获取类的所有元数据值（包含继承链）
 *
 * 沿原型链向上收集所有类级别的元数据，子类元数据优先（不会被父类覆盖）
 *
 * @param Class - 目标构造函数
 * @returns 包含所有元数据键值的对象
 */
export function getClassMetadataValues(Class: Object): Record<string | symbol, any> {
	let r = Object.create(null);
	let Super = Class;
	do {
		let data = classWeakMap.get(Super[Symbol.metadata]);
		if(data) {
			let names = Object.getOwnPropertyNames(data);
			let i = names.length;
			while(i--) {
				let name = names[i];
				if(!(name in r)) {
					r[name] = data[name];
				}
			}
			let symbols = Object.getOwnPropertySymbols(data);
			let j = symbols.length;
			while(j--) {
				let symbol = symbols[j];
				if(!(symbol in r)) {
					r[symbol] = data[symbol];
				}
			}
		}
		Super = Object.getPrototypeOf(Super);
	} while(Super && Super !== Function.prototype);
	return r;
};
