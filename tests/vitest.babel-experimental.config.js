const { babel } = require("@rollup/plugin-babel");
const inject = require("@rollup/plugin-inject");
const vue = require("@vitejs/plugin-vue");
const vueJsx = require("@vitejs/plugin-vue-jsx");
const path = require("path");
const { defineConfig } = require('vite');
const sky = require('../node_modules/sky-core/createRollupPlugin');

module.exports = defineConfig(function({ command, mode }) {
	var babelRuntimePath = require.resolve("@babel/runtime/package.json", {
		paths: [process.cwd()]
	});
	var babelRuntimePackage = require(babelRuntimePath);
	var babelRuntimeVersion = babelRuntimePackage.version;

	return {
		resolve: {
			alias: {
				'@': path.resolve(__dirname, "../src")
			}
		},
		define: {
			// 关闭 Options API 支持（关键）
			__VUE_OPTIONS_API__: false,
		},
		esbuild: false,
		plugins: [
			{
				...sky('es2015'),
				enforce: "pre"
			},
			{
				...vue({
					devServer: {
						config: {
							oxc: {
								decorators: {
									legacy: true,
									emitMetadata: true
								},
								assumptions: {
									setPublicClassFields: true
								},
								typescript: {
									removeClassFieldsWithoutInitializer: true
								},
							},
							esbuild: {
								tsconfigRaw: JSON.stringify({
									compilerOptions: {
										experimentalDecorators: true,
										useDefineForClassFields: false,
										emitDecoratorMetadata: false,
									}
								})
							}
						}
					}
				}),
				enforce: "pre"
			},
			{
				...babel({
					babelHelpers: 'runtime',
					plugins: [
						["@babel/plugin-transform-runtime", {
							absoluteRuntime: false,
							corejs: false,
							helpers: true,
							regenerator: true,
							useESModules: true,
							version: babelRuntimeVersion
						}],
						"babel-plugin-mark-fields",
						["babel-plugin-transform-typescript-decorators", {
							experimentalDecorators: true,
							useDefineForClassFields: false
						}],
						["@babel/plugin-transform-typescript", {
							allowNamespaces: true,
							allowDeclareFields: false,
							isTSX: true,
							disallowAmbiguousJSXLike: true,
							onlyRemoveTypeImports: false,
							optimizeConstEnums: true
						}],
					],
					extensions: [''],
					filter(id) {
						return /\.tsx?$/.test(id);
					},
				}),
				enforce: "pre"
			},
			(function() {
				let plugin = vueJsx({
					tsTransform: 'built-in',
					include: /\.(j|t)sx$/
				});
				plugin.transform.order = undefined;
				plugin.enforce = "pre";
				return plugin;
			})(),
			inject({
				modules: {
					"Symbol.metadata": "sky-core/pure/Symbol/metadata"
				}
			})
		],
		optimizeDeps: {
			include: [],
			exclude: ['sky-core', '@babel/runtime']
		},
		test: {
			environment: 'jsdom',
			globals: true,
			transformMode: {
				web: [/\.[jt]sx?$/],
			},
			include: ['tests/**/*.test.{js,ts,jsx,tsx}'],
			exclude: ['tests/metadata/proposal.test.ts', 'tests/type-metadata/**', '**/node_modules/**'],
		},
	};
});
