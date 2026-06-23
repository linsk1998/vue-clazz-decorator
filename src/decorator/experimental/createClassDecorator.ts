import type { LegacyClassDecorator } from "../types";

/**
 * 创建旧版（Legacy）类装饰器工厂（实验性阶段）
 *
 * 仅支持 TypeScript experimentalDecorators 模式，
 * 在类定义时调用初始化回调 `initClass`
 *
 * @param initClass - 类初始化回调，接收构造函数作为第二个参数（此时 metadata 即为 Class 自身）
 * @returns 旧版类装饰器
 */
export function createFieldDecorator(initClass: (Class: Function, metadata: object) => any): LegacyClassDecorator {
	return function(Class) {
		initClass(Class, Class);
	};
}
