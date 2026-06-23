/**
 * 存储字段级别元数据的 WeakMap
 *
 * 键为 `Symbol.metadata` 对象，值为 `Record<string, Record<string | symbol, any>>`，
 * 外层记录字段名与字段元数据的映射
 */
export const fieldWeakMap = new WeakMap<Object, Record<string, Record<string | symbol, any>>>();

/**
 * 为字段定义元数据
 *
 * 将指定的元数据键值对写入指定字段的元数据容器中。
 * 如果该键已存在则不会覆盖（遵循装饰器先声明优先原则）
 *
 * @param metadataKey - 元数据键名
 * @param metadataValue - 元数据值
 * @param meta - 元数据容器（通常为 `Class[Symbol.metadata]`）
 * @param name - 字段名称
 */
export function defineFieldMetadata(metadataKey: string | symbol, metadataValue: any, meta: Object, name: string) {
	let fieldMetadata = fieldWeakMap.get(meta);
	if(!fieldMetadata) {
		fieldMetadata = {};
		fieldWeakMap.set(meta, fieldMetadata);
	}
	let data = fieldMetadata[name];
	if(!data) {
		data = fieldMetadata[name] = Object.create(null);
	}
	if(!(metadataKey in data)) {
		data[metadataKey] = metadataValue;
	}
}
