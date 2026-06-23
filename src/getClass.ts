/**
 * 从目标值中获取构造函数
 *
 * 如果传入的已经是函数，则直接返回；否则返回其 `constructor` 属性
 *
 * @param Class - 目标构造函数或实例对象
 * @returns 构造函数
 */
export function getClass(Class: Object): Function {
	return typeof Class === "function" ? Class : Class.constructor;
}
