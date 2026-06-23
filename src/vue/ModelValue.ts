import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type ModelValueDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(key: string) => AutoPropertyDecorator<This, Value>
);

/**
 * v-model 装饰器
 *
 * 标记一个属性为组件的 v-model 绑定值。
 * - 不带参数：默认使用 `modelValue` 作为 prop 名
 * - 带字符串参数：使用指定的 prop 名
 */
const decorator = metadata('modelValue', 'modelValue');
const ModelValue: ModelValueDecorator<object, any> = function(key: any) {
	if(typeof key === 'string') {
		return metadata('modelValue', key);
	}
	return decorator.apply(this, arguments);
};

export { ModelValue };

