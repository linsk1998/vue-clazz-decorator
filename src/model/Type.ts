import { metadata } from "@/metadata/metadata";
import type { ModelClassWithInitializer } from "@/vue/Reactive";


/**
 * 字段类型装饰器
 *
 * 指定 Model 字段的类型，用于水合（hydrate）时将原始值转换为类型化实例。
 * 支持嵌套 Model 类型和 ArrayType/ReactiveArrayType 数组类型
 *
 * @typeParam T - 目标类型
 * @param type - 类型的构造函数（需带 `new(init?)` 签名，即为 `ModelClassWithInitializer`）
 * @returns 属性装饰器
 */
export function Type<T>(type: ModelClassWithInitializer<T>) {
	return metadata<any, T>('type', type);
}
