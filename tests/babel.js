const { babel } = require("@rollup/plugin-babel");

module.exports = function(options = {}) {
	var {
		experimentalDecorators = false,
		useDefineForClassFields = true,
		emitDecoratorMetadata = false,
	} = options;

	var babelRuntimePath = require.resolve("@babel/runtime/package.json", {
		paths: [process.cwd()]
	});
	var babelRuntimePackage = require(babelRuntimePath);
	var babelRuntimeVersion = babelRuntimePackage.version;

	var plugins = [
		["@babel/plugin-transform-runtime", {
			absoluteRuntime: false,
			corejs: false,
			helpers: true,
			regenerator: true,
			useESModules: true,
			version: babelRuntimeVersion
		}],
	];

	if(experimentalDecorators) {
		// 实验性装饰器模式: 使用 babel-plugin-transform-typescript-decorators
		plugins.push("babel-plugin-mark-fields");
		if(emitDecoratorMetadata) {
			plugins.push("babel-plugin-transform-typescript-metadata");
		}
		plugins.push(["babel-plugin-transform-typescript-decorators", {
			experimentalDecorators: true,
			useDefineForClassFields
		}]);
	} else {
		// Proposal 装饰器模式 (2023-11): 使用 @babel/plugin-proposal-decorators
		plugins.push(["@babel/plugin-proposal-decorators", {
			version: "2023-11",
			decoratorsBeforeExport: true
		}]);
	}

	plugins.push(["@babel/plugin-transform-typescript", {
		allowNamespaces: true,
		allowDeclareFields: useDefineForClassFields,
		isTSX: true,
		disallowAmbiguousJSXLike: true,
		onlyRemoveTypeImports: false,
		optimizeConstEnums: true
	}]);

	return {
		...babel({
			babelHelpers: 'runtime',
			plugins: plugins,
			extensions: [''],
			filter(id) {
				return /\.tsx?$/.test(id);
			},
		}),
		enforce: "pre"
	};
};
