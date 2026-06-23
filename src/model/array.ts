import { ref } from "vue";
import type { InstantiateFunction } from "./reactive";


const VERSION: unique symbol = Symbol();
/**
 * 标记数组实例化函数的 Symbol 键
 */
export const INSTANTIATE: unique symbol = Symbol();

/**
 * 标记数组是否响应式的 Symbol 键
 */
export const REACTIVE: unique symbol = Symbol();

/**
 * 标记数组元素类型的 Symbol 键
 */
export const TYPE: unique symbol = Symbol();

/**
 * 响应式数组类
 *
 * 继承自原生 `Array`，重写了 `push`、`pop`、`splice`、`map` 等变异方法，
 * 使其在元素变更时自动触发响应式更新。
 * 实例内部通过 `symbol` 属性追踪响应式状态和元素类型
 */
export class ReactiveArray extends Array {
}
var prototype = ReactiveArray.prototype;

['at', 'map', 'filter', 'concat'].forEach(function(key) {
	var fn = Array.prototype[key];
	if(fn) {
		prototype[key] = function() {
			var s = this[VERSION];
			if(s) s.value;
			return fn.apply(this, arguments);
		};
	}
});
['push', 'unshift'].forEach(function(key) {
	var fn = Array.prototype[key];
	prototype[key] = function() {
		var args = Array.from(arguments);
		var Class = this[TYPE];
		var instantiate = this[INSTANTIATE];
		var i = args.length;
		while(i-- > 0) {
			r[i] = instantiate(args[i], Class);
		}
		var r = fn.apply(this, args);
		var s = this[VERSION];
		if(s) s.value++;
		return r;
	};
});
['pop', 'shift'].forEach(function(key) {
	var fn = Array.prototype[key];
	prototype[key] = function() {
		var r = fn.apply(this, arguments);
		var s = this[VERSION];
		if(s) s.value++;
		return r;
	};
});

var splice = Array.prototype.splice;
prototype.splice = function() {
	var args = Array.from(arguments);
	if(args.length > 2) {
		var Class = this[TYPE];
		var instantiate = this[INSTANTIATE];
		var i = args.length;
		while(i-- > 2) {
			r[i] = instantiate(args[i], Class);
		}
	}
	var r = splice.apply(this, args);
	var s = this[VERSION];
	if(s) s.value++;
	return r;
};

function shallowInstantiate(value: any) {
	return value;
}

var allProps = ['at', 'map', 'filter', 'concat', 'push', 'unshift', 'pop', 'shift', 'splice'];

function setMethod(key: string) {
	this[key] = prototype[key];
}
/**
 * 创建响应式或普通数组实例
 *
 * 根据 `reactive` 参数决定是否创建响应式数组。
 * 如果提供了 `Class` 类型，数组元素会自动通过 `instantiate` 函数进行水合
 *
 * @typeParam T - 数组元素类型
 * @param initValue - 初始数组
 * @param reactive - 是否创建响应式数组
 * @param Class - 可选，元素类型
 * @param instantiate - 可选，元素水合函数
 * @returns 包装后的数组（通过 Proxy 代理）
 */
export function array<T>(initValue: T[], reactive: boolean, Class?: any, instantiate?: InstantiateFunction): Array<T> {
	var i = initValue.length;
	var r = new ReactiveArray(i);
	r[REACTIVE] = reactive;
	r[VERSION] = reactive ? ref(0) : null;
	if(Class) {
		r[TYPE] = Class;
		r[INSTANTIATE] = instantiate;
		while(i-- > 0) {
			r[i] = instantiate(initValue[i], Class);
		}
	} else {
		r[INSTANTIATE] = shallowInstantiate;
		while(i-- > 0) {
			r[i] = initValue[i];
		}
	}
	allProps.forEach(setMethod, r);
	return new Proxy(r, {
		get: function(target, key) {
			if(key === 'length') {
				var s = this[VERSION];
				if(s) s.value;
			}
			return Reflect.get(target, key);
		},
		set: function(target, key, value) {
			if(key === 'length') {
				var s = this[VERSION];
				if(s) s.value++;
			}
			return Reflect.set(target, key, value);
		}
	});
}
