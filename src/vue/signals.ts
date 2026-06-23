import { computed as $computed, ref } from "vue";

function get<T>(): T | null | undefined {
	return this.value;
}
function set<T>(value: T) {
	this.value = value;
}

export function state<T>(initValue: T): { get: () => T | null | undefined; set: (value: T) => void; } {
	var _ref: any = ref<T>(initValue);
	_ref.get = get;
	_ref.set = set;
	return _ref;
}

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

