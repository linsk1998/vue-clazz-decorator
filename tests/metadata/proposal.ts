import { metadata } from "../../src/metadata/proposal/metadata";

@metadata('key', "value")
export class Animal {
	@metadata('key', "field")
	foo;
}
