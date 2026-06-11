import { defineFieldMetadata } from "../../metadata/defineFieldMetadata";
import type { LegacyPropertyDecorator } from "../types";

export function createFieldDecorator<This extends object, Value = any>(metadataKey: string, metadataValue: any): LegacyPropertyDecorator<This> {
	return function(target: any, context: any) {
		defineFieldMetadata(metadataKey, metadataValue, target.constructor, context);
	};
}
