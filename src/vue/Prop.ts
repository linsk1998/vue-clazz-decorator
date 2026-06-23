import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type PropDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(from: string) => AutoPropertyDecorator<This, Value>
);

/**
 * Props 装饰器
 *
 * 标记一个属性为组件的 props。
 * - 不带参数：使用字段名作为 prop 名
 * - 带字符串参数：使用指定的 prop 名
 */
const decorator = metadata('prop', null);
const Prop: PropDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('prop', from);
	}
	return decorator.apply(this, arguments);
};


export { Prop };

