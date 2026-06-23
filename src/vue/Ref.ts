import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type RefDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(from: string) => AutoPropertyDecorator<This, Value>
);

/**
 * 模板引用装饰器
 *
 * - 不带参数：使用字段名作为引用名
 * - 带字符串参数：使用指定的引用名
 */
const decorator = metadata('ref', null);
const Ref: RefDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('ref', from);
	}
	return decorator.apply(this, arguments);
};


export { Ref };

