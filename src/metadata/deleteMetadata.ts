import { getClass } from "../getClass";
import { classWeakMap } from "./defineClassMetadata";
import { fieldWeakMap } from "./defineFieldMetadata";

/**
 * 删除类级别或字段级别的元数据
 *
 * 根据是否传入 `name` 参数决定删除类级别还是字段级别的元数据。
 * 仅删除自身（own）的元数据键，不会删除继承的元数据
 *
 * @param metadataKey - 元数据键名
 * @param Class - 目标类或实例
 * @param name - 可选，字段名称
 * @returns 是否成功删除
 */
export function deleteMetadata(metadataKey: string | symbol, Class: Object, name?: string) {
	if(name) {
		Class = getClass(Class);
		let meta = Class[Symbol.metadata];
		if(meta) {
			let fieldMetadata = fieldWeakMap.get(meta);
			if(fieldMetadata) {
				let data = fieldMetadata[name];
				if(data) {
					if(Object.hasOwn(data, metadataKey)) {
						delete data[metadataKey];
						return true;
					}
				}
			}
		}
	} else {
		let meta = Class[Symbol.metadata];
		if(meta) {
			let classMetadata = classWeakMap.get(meta);
			if(classMetadata) {
				if(Object.hasOwn(classMetadata, metadataKey)) {
					delete classMetadata[metadataKey];
					return true;
				}
			}
		}
	}
	return false;
}
