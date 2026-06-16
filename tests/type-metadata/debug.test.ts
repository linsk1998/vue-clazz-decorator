import { describe, it } from 'vitest';

describe('debug', () => {
	it('test inject inside IIFE vs outside', () => {
		// Outside IIFE - should be injected
		console.log('Outside: typeof Reflect.metadata:', typeof Reflect.metadata);

		// Inside IIFE - test if inject works
		var testIIFE = (function() {
			return function(k: string, v: any) {
				if(typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
			};
		})();

		console.log('IIFE source:', testIIFE.toString());
		var iifeResult = testIIFE("design:type", String);
		console.log('IIFE result:', typeof iifeResult, iifeResult);

		// Inside regular function
		function regularFn(k: string, v: any) {
			if(typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
		}
		console.log('Regular fn source:', regularFn.toString());
		var regularResult = regularFn("design:type", String);
		console.log('Regular fn result:', typeof regularResult, regularResult);

		// @ts-ignore - TS-generated helper
		console.log('__metadata source:', __metadata.toString());
		// @ts-ignore
		var helperResult = __metadata("design:type", String);
		console.log('__metadata result:', typeof helperResult, helperResult);
	});
});
