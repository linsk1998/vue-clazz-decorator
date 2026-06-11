import { metadata } from "../../src/metadata/experimental/metadata";

@metadata('key', "value")
export class Animal {
	@metadata('key', "field")
	foo: any;
}
