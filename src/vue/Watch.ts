import { metadata } from "@/metadata/metadata";
import type { AutoMethodDecorator } from "../decorator/types";

/**
 * Watch 配置选项
 */
interface WatchOptions {
	deep?: boolean;
	immediate?: boolean;
}

/**
 * Watch 数据源函数类型
 *
 * @typeParam This - 组件实例类型
 * @typeParam Value - 数据源返回值类型
 * @param instance - 当前组件实例（this 绑定）
 */
type WatchSource<This extends object, Value> = (this: This, instance: This) => Value;

/**
 * Watch 回调函数类型
 *
 * @typeParam Value - 监听值的类型
 */
type WatchCallback<Value> = (newValue: Value, oldValue: Value) => any;

type WatchDecorator<This extends object, Value extends WatchCallback<any>> = AutoMethodDecorator<This, Value>;

/**
 * Watch 装饰器
 *
 * 监听属性变化并执行回调。
 * - `@Watch('xxx')`：监听指定字段名的变化
 * - `@Watch(fn)`：通过函数返回值作为监听源
 * - 支持 `{ deep, immediate }` 选项
 *
 * @param source - 监听目标：字段名字符串或数据源函数
 * @param options - 可选，监听选项（deep、immediate）
 * @returns 方法装饰器
 */
function Watch<This extends object, Value>(source: string, options?: WatchOptions): WatchDecorator<This, WatchCallback<Value>>;
function Watch<This extends object, Value>(source: WatchSource<This, any>, options?: WatchOptions): WatchDecorator<This, WatchCallback<Value>>;
function Watch(source: Function | string, options?: WatchOptions) {
	if(typeof source === 'string') {
		let key = source;
		source = function() { return this[key]; };
	}
	return metadata('watch', { source, options });
}

export { Watch };

