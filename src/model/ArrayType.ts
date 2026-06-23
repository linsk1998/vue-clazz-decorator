import { ReactiveArray } from "./array";

/**
 * 创建带类型信息的数组构造函数
 *
 * 返回一个继承自 `Array` 的子类，其 `static type` 属性指向给定的类型。
 * 用于 `native` 模型中声明数组字段的类型
 *
 * @typeParam T - 数组元素类型
 * @param type - 元素类型的构造函数
 * @returns 带类型标记的数组构造函数
 */
export function ArrayType<T>(type: { new(): T; }): { new(): T[]; } {
	class SubArray extends Array {
		static type = type;
	}
	return SubArray;
}

/**
 * 创建带类型信息的响应式数组构造函数
 *
 * 返回一个继承自 `ReactiveArray` 的子类，其 `static type` 属性指向给定的类型。
 * 用于 `reactive` 模型中声明数组字段的类型
 *
 * @typeParam T - 数组元素类型
 * @param type - 元素类型的构造函数
 * @returns 带类型标记的响应式数组构造函数
 */
export function ReactiveArrayType<T>(type: { new(): T; }): { new(): T[]; } {
	class SubArray extends ReactiveArray {
		static type = type;
	}
	return SubArray;
}
