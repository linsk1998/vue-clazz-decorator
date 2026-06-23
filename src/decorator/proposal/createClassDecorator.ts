import type { EsClassDecorator } from "../types";

/**
 * 创建 ES 新提案阶段类装饰器工厂
 *
 * 使用 `ClassDecoratorContext` 上下文，在类定义时调用初始化回调 `initClass`
 *
 * @typeParam T - 类的实例类型
 * @param initClass - 类初始化回调，接收构造函数和 context.metadata
 * @returns ES 新提案类装饰器
 */
export function createFieldDecorator<T extends Object>(initClass: (Class: { new(...args: any[]): T; }, metadata: {}) => any): EsClassDecorator<T> {
	return function(Class, context) {
		initClass(Class, context.metadata);
	};
}
