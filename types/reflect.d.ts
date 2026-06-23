import type { defineMetadata as _defineMetadata, deleteMetadata as _deleteMetadata, getMetadata as _getMetadata, getMetadataKeys as _getMetadataKeys, getOwnMetadata as _getOwnMetadata, getOwnMetadataKeys as _getOwnMetadataKeys, hasMetadata as _hasMetadata, hasOwnMetadata as _hasOwnMetadata, metadata as _metadata } from "./index";

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
