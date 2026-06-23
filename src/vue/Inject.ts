import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type ContextDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(from: string) => AutoPropertyDecorator<This, Value>
);

/**
 * 依赖注入装饰器
 *
 * 从父组件通过 `provide` 注入值。
 * - 不带参数：使用字段名作为注入键
 * - 带字符串参数：使用指定的注入键
 */
const decorator = metadata('inject', null);
const Inject: ContextDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('inject', from);
	}
	return decorator.apply(this, arguments);
};

export { Inject };

