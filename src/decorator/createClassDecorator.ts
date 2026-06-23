import { ensureMetadata } from "../ensureMetadata";
import type { EsClassDecorator, LegacyClassDecorator } from "./types";

/**
 * 创建兼容多阶段提案的类装饰器工厂
 *
 * 生成的装饰器同时支持旧版（Legacy）和 ES 新提案（ClassDecoratorContext）两种调用方式，
 * 在类定义时调用初始化回调 `initClass`
 *
 * @typeParam T - 类的实例类型
 * @param initClass - 类初始化回调，接收构造函数和元数据容器
 * @returns 兼容多阶段提案的类装饰器
 */
export function createFieldDecorator<T extends Object>(initClass: (Class: { new(...args: any[]): T; }, metadata: {}) => any): EsClassDecorator<T> & LegacyClassDecorator {
	return function(Class: any, context?: any) {
		initClass(Class, context ? context.metadata : ensureMetadata(Class));
	};
}
