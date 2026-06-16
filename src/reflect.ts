import type { defineMetadata as _defineMetadata } from "./metadata/defineMetadata";
import type { deleteMetadata as _deleteMetadata } from "./metadata/deleteMetadata";
import type { getMetadata as _getMetadata } from "./metadata/getMetadata";
import type { getMetadataKeys as _getMetadataKeys } from "./metadata/getMetadataKeys";
import type { getOwnMetadata as _getOwnMetadata } from "./metadata/getOwnMetadata";
import type { getOwnMetadataKeys as _getOwnMetadataKeys } from "./metadata/getOwnMetadataKeys";
import type { hasMetadata as _hasMetadata } from "./metadata/hasMetadata";
import type { hasOwnMetadata as _hasOwnMetadata } from "./metadata/hasOwnMetadata";
import type { metadata as _metadata } from "./metadata/metadata";

declare global {
	namespace Reflect {
		var metadata: typeof _metadata;
		var defineMetadata: typeof _defineMetadata;
		var hasMetadata: typeof _hasMetadata;
		var hasOwnMetadata: typeof _hasOwnMetadata;
		var getMetadata: typeof _getMetadata;
		var getOwnMetadata: typeof _getOwnMetadata;
		var getMetadataKeys: typeof _getMetadataKeys;
		var getOwnMetadataKeys: typeof _getOwnMetadataKeys;
		var deleteMetadata: typeof _deleteMetadata;
	}
}
