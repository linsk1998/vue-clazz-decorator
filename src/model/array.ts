import { ref } from "vue";
import type { InstantiateFunction } from "./reactive";


const VERSION: unique symbol = Symbol();
export const INSTANTIATE: unique symbol = Symbol();
export const REACTIVE: unique symbol = Symbol();
export const TYPE: unique symbol = Symbol();

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
