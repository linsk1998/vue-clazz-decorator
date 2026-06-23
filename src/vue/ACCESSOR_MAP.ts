/**
 * 属性访问器接口
 *
 * @typeParam T - 属性值类型
 */
export interface Accessor<T> {
	get(): T;
	set?(value: T): void;
}

/**
 * 存储实例与其属性访问器映射的 WeakMap
 *
 * 键为组件/模型实例，值为字段名到 `Accessor` 的映射。
 * 用于在运行时统一读取/写入属性值（支持响应式、计算属性等）
 */
export const ACCESSOR_MAP = new WeakMap<any, Record<string, Accessor<any>>>();
