import { describe, expect, it } from 'vitest';

var deco = Reflect.metadata('deco', true);

describe('emitDecoratorMetadata', () => {
	it('design:type for property', () => {

		class Foo {
			@deco
			name: string;

			@deco
			age: number;
		}

		expect(Reflect.getMetadata('design:type', Foo.prototype, 'name')).toBe(String);
		expect(Reflect.getMetadata('design:type', Foo.prototype, 'age')).toBe(Number);
	});

	it('design:type and design:paramtypes for method', () => {
		class Bar {
			@deco
			greet(name: string, count: number): boolean {
				return true;
			}
		}

		expect(Reflect.getMetadata('design:type', Bar.prototype, 'greet')).toBe(Function);
		expect(Reflect.getMetadata('design:paramtypes', Bar.prototype, 'greet')).toEqual([String, Number]);
		var returnType = Reflect.getMetadata('design:returntype', Bar.prototype, 'greet');
		// babel-plugin-transform-typescript-metadata 不支持 design:returntype
		if(returnType !== undefined) {
			expect(returnType).toBe(Boolean);
		}
	});

	it('design:paramtypes for constructor', () => {
		@deco
		class Baz {
			constructor(public name: string, public value: number) {}
		}

		expect(Reflect.getMetadata('design:paramtypes', Baz)).toEqual([String, Number]);
	});

	it('design:type for class reference', () => {
		class Inner {}

		class Outer {
			@deco
			child: Inner;
		}

		expect(Reflect.getMetadata('design:type', Outer.prototype, 'child')).toBe(Inner);
	});
});
