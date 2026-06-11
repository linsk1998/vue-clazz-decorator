import { describe, expect, it } from 'vitest';
import { defineMetadata } from "../../src/metadata/defineMetadata";
import { deleteMetadata } from "../../src/metadata/deleteMetadata";
import { getClassMetadataValues } from "../../src/metadata/getClassMetadataValues";
import { getFieldMetadataValues } from "../../src/metadata/getFieldMetadataValues";
import { getMetadata } from "../../src/metadata/getMetadata";
import { getOwnMetadata } from "../../src/metadata/getOwnMetadata";
import { getOwnMetadataKeys } from "../../src/metadata/getOwnMetadataKeys";
import { hasOwnMetadata } from "../../src/metadata/hasOwnMetadata";

describe('metadata', () => {
	it('define', () => {
		class Cat { }

		defineMetadata('foo', 123, Cat);
		defineMetadata('bar', 456, Cat.prototype, 'field');

		expect(getOwnMetadata('foo', Cat)).toBe(123);
		expect(getOwnMetadata('bar', Cat.prototype, 'field')).toBe(456);
	});
	it('emun', () => {
		class Cat { }

		defineMetadata('foo', 123, Cat);
		defineMetadata('bar', 456, Cat);

		expect(getOwnMetadataKeys(Cat)).toEqual(['foo', 'bar']);
		expect(hasOwnMetadata('bar', Cat)).ok;
		expect(hasOwnMetadata('foo', Cat)).ok;
		expect(hasOwnMetadata('hhh', Cat)).not.ok;

		deleteMetadata('bar', Cat);

		expect(getOwnMetadataKeys(Cat)).toEqual(['foo']);
		expect(hasOwnMetadata('foo', Cat)).ok;
		expect(hasOwnMetadata('bar', Cat)).not.ok;


		class Dog { }

		defineMetadata('foo', 123, Dog.prototype, 'field');
		defineMetadata('bar', 456, Dog.prototype, 'field');

		expect(getOwnMetadataKeys(Dog.prototype, 'field')).toEqual(['foo', 'bar']);
		expect(hasOwnMetadata('bar', Dog.prototype, 'field')).ok;
		expect(hasOwnMetadata('foo', Dog.prototype, 'field')).ok;
		expect(hasOwnMetadata('hhh', Dog.prototype, 'field')).not.ok;

		deleteMetadata('bar', Dog.prototype, 'field');

		expect(getOwnMetadataKeys(Dog.prototype, 'field')).toEqual(['foo']);
		expect(hasOwnMetadata('foo', Dog.prototype, 'field')).ok;
		expect(hasOwnMetadata('bar', Dog.prototype, 'field')).not.ok;
	});
	it('extends', () => {
		class Animal { }
		class Cat extends Animal { }

		defineMetadata('foo', 123, Animal);
		defineMetadata('bar', 456, Animal.prototype, 'field');

		expect(getMetadata('foo', Cat)).toBe(123);
		expect(getOwnMetadata('foo', Cat)).not.toBe(123);
		expect(getMetadata('bar', Cat.prototype, 'field')).toBe(456);
		expect(getOwnMetadata('bar', Cat.prototype, 'field')).not.toBe(456);
	});
	it('getClassMetadataValues', () => {
		class Animal { }
		class Cat extends Animal { }

		defineMetadata('foo', 1, Animal);
		defineMetadata('bar', 2, Cat);

		expect(getClassMetadataValues(Cat)).toEqual({
			"foo": 1,
			"bar": 2
		});
	});
	it('getFieldMetadataValues', () => {
		class Animal { }
		class Cat extends Animal { }

		defineMetadata('foo', 3, Animal.prototype, 'field');
		defineMetadata('bar', 4, Cat.prototype, 'field');

		expect(getFieldMetadataValues(Cat)).toEqual({
			'field': {
				"foo": 3,
				"bar": 4
			}
		});
	});
});
