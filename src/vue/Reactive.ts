import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";
import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

/**
 * 带初始化器的 Model 类构造函数类型
 *
 * 构造函数可接收一个可选初始化对象，用于在实例化时批量赋值属性
 *
 * @typeParam T - 模型实例类型
 */
export interface ModelClassWithInitializer<T> {
	new(init?: Record<keyof T, any>): T;
}

type ReactiveDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & ((type: ModelClassWithInitializer<Value>) => AutoPropertyDecorator<This, Value>);

/**
 * 响应式属性装饰器
 *
 * 标记一个属性为深层响应式（使用 `reactive` 水合）。
 * 与 `@State` 不同，`@Reactive` 会创建 `shallowRef` 并追踪嵌套对象的变化。
 * - 不带参数：标记为响应式属性
 * - 带类型参数：指定嵌套 Model 类型，自动进行类型水合
 */
const decorator = metadata('reactive', null);
const Reactive: ReactiveDecorator<object, any> = function(type?: any) {
	if(arguments.length <= 1) {
		return function(target: any, context: any) {
			var property, metadata;
			if(typeof context === "string") {
				property = context;
				metadata = ensureMetadata(target.constructor);
			} else {
				property = context.name;
				metadata = context.metadata;
			}
			defineFieldMetadata('reactive', null, metadata, property);
			defineFieldMetadata('type', type, metadata, property);
		};
	}
	return decorator.apply(this, arguments);
};

export { Reactive };

