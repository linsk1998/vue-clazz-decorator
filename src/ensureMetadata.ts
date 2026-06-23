/**
 * 确保目标类上存在 `Symbol.metadata` 元数据容器
 *
 * 如果不存在则创建一个空对象并赋值给 `Class[Symbol.metadata]`
 *
 * @param Class - 目标构造函数
 * @returns 元数据容器对象
 */
export function ensureMetadata(Class: Function) {
	let meta = Class[Symbol.metadata];
	if(!meta) {
		meta = Class[Symbol.metadata] = Object.create(null);
	}
	return meta;
}
