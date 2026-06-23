import { computed as $computed, ref } from "vue";

function get<T>(): T | null | undefined {
	return this.value;
}
function set<T>(value: T) {
	this.value = value;
}

/**
 * 创建响应式状态
 *
 * @typeParam T - 状态值的类型
 * @param initValue - 初始值
 * @returns 带有 get/set 的响应式状态对象
 */
export function state<T>(initValue: T): { get: () => T | null | undefined; set: (value: T) => void; } {
	var _ref: any = ref<T>(initValue);
	_ref.get = get;
	_ref.set = set;
	return _ref;
}

/**
 * 创建计算属性
 *
 * @typeParam T - 计算属性的类型
 * @param getter - 计算的 getter 函数
 * @param setter - 可选，计算的 setter 函数
 * @returns 带有 get/set 的计算属性对象
 */
function computed<T>(getter: () => T): { get: () => T | null | undefined; };
function computed<T>(getter: () => T, setter: (value: T) => void): { get: () => T | null | undefined; set: (value: T) => void; };
function computed<T>(getter: () => T, setter?: (value: T) => void) {
	if(setter) {
		let _computed: any = $computed<T>({ get: getter, set: setter });
		_computed.get = get;
		_computed.set = set;
		return _computed;
	} else {
		let _computed: any = $computed<T>(getter);
		_computed.get = get;
		return _computed;
	}
}
export { computed };

