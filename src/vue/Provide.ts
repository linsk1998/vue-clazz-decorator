import { metadata } from "@/metadata/metadata";
import type { AutoClassDecorator, AutoPropertyDecorator } from "../decorator/types";

type ProvideDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(key: string | symbol) => (AutoClassDecorator<This> & AutoPropertyDecorator<This, Value>)
);

/**
 * 依赖提供装饰器
 *
 * 向子组件提供依赖注入值。
 * - 用于字段/方法：使用字段名作为 provide 键
 * - 用于类：向子组件提供整个组件实例
 * - 带参数：使用指定的 provide 键
 */
const decorator = metadata('provide', null);
const Provide: ProvideDecorator<object, any> = function(key: any) {
	if(typeof key === 'string' || typeof key === 'symbol') {
		return metadata('provide', key);
	}
	return decorator.apply(this, arguments);
};

export { Provide };

