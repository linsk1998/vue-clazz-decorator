const typescript = require("@rollup/plugin-typescript");

module.exports = function(options = {}) {
	var {
		experimentalDecorators = false,
		useDefineForClassFields = true,
		emitDecoratorMetadata = false,
	} = options;
	return {
		...typescript({
			compilerOptions: {
				experimentalDecorators,
				emitDecoratorMetadata,
				useDefineForClassFields
			},
			transformers: experimentalDecorators ?
				(program) => ({
					before: [
						require("typescript-plugin-mark-fields")(program, {})
					]
				}) :
				null
		}),
		enforce: "pre"
	};
};
