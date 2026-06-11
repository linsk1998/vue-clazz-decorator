import { describe, expect, it } from 'vitest';
import { getClassMetadataValues } from "../../src/metadata/getClassMetadataValues";
import { getFieldMetadataValues } from "../../src/metadata/getFieldMetadataValues";
import { Animal } from "./proposal";

describe('decorators', () => {
	it('proposal', () => {
		expect(getClassMetadataValues(Animal)).toEqual({
			'key': "value"
		});
		expect(getFieldMetadataValues(Animal)).toEqual({
			foo: {
				'key': "field"
			}
		});
	});
});
