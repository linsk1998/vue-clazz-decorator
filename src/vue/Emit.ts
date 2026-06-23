import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type EmitDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(key: string) => AutoPropertyDecorator<This, Value>
);

/**
 * 事件发射装饰器
 *
 * 标记一个方法或属性为组件事件发射器。
 * - 不带参数：方法名即事件名（转换为首字母大写加 `on` 前缀）
 * - 带字符串参数：使用指定的事件名
 */
const decorator = metadata('emit', null);
const Emit: EmitDecorator<object, any> = function(target: any) {
	if(typeof target === 'string') {
		return metadata('emit', 'on' + target.charAt(0).toUpperCase() + target.slice(1));
	}
	return decorator.apply(this, arguments);
};

export { Emit };

