import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";
import type { AutoAccessorDecorator } from "../decorator/types";


type ComputedDecorator<This extends object, Value> = AutoAccessorDecorator<This, Value>;

/**
 * 计算属性装饰器
 *
 * 标记一个 get/set 访问器为 Vue 计算属性（computed）。
 * 在组件或 ViewModel 中使用，自动将 getter 包装为 `computed()`
 */
const Computed: ComputedDecorator<object, any> = function(target: any, context?: any) {
	const metadataKey = 'computed';
	const metadataValue = {};
	if(typeof context === "string") {
		defineFieldMetadata(metadataKey, metadataValue, ensureMetadata(target.constructor), context);
	} else {
		defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
	}
};

export { Computed };

