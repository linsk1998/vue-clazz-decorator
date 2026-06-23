/**
 * 存储类级别元数据的 WeakMap
 *
 * 键为 `Symbol.metadata` 对象，值为 `Record<string | symbol, any>` 元数据映射
 */
export const classWeakMap = new WeakMap<Object, Record<string | symbol, any>>();

/**
 * 为类定义元数据
 *
 * 将指定的元数据键值对写入类的元数据容器中。
 * 如果该键已存在则不会覆盖（遵循装饰器先声明优先原则）
 *
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @param meta - 元数据容器（通常为 `Class[Symbol.metadata]`）
 */
export function defineClassMetadata(metadataKey: string | symbol, metadataValue: any, meta: Object) {
	let classMetadata = classWeakMap.get(meta);
	if(!classMetadata) {
		classMetadata = Object.create(null);
		classWeakMap.set(meta, classMetadata);
	}
	if(!(metadataKey in classMetadata)) {
		classMetadata[metadataKey] = metadataValue;
	}
}
