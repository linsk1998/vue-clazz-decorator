import { defineFieldMetadata } from "../../metadata/defineFieldMetadata";
import type { EsAccessorDecorator, EsFieldDecorator } from "../types";

export function createFieldDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> {
	return function(target: any, context: any) {
		defineFieldMetadata(metadataKey, metadataValue, context.metadata, context.name);
	};
}
