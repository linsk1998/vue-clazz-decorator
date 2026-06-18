const { nodeResolve } = require("@rollup/plugin-node-resolve");
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
				'@': path.resolve(__dirname, "../src"),
				'vue-clazz-decorator': path.resolve(__dirname, '../src/index.ts'),
			}
		},
		define: {
			__VUE_OPTIONS_API__: false,
		},
		esbuild: false,
		plugins: [
			{
				...sky('es2015'),
				enforce: "pre"
			},
			(function() {
				let plugin = nodeResolve({
					browser: true
				});
				plugin.resolveId.order = undefined;
				plugin.enforce = "pre";
				return plugin;
			})(),
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
						"babel-plugin-transform-typescript-metadata",
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
					'Reflect.metadata': ["vue-clazz-decorator", 'metadata'],
					'Reflect.getMetadata': ["vue-clazz-decorator", 'getMetadata'],
					'Reflect.getOwnMetadata': ["vue-clazz-decorator", 'getOwnMetadata'],
					"Symbol.metadata": "sky-core/pure/Symbol/metadata"
				}
			})
		],
		optimizeDeps: {
			include: [],
			exclude: ['sky-core', '@babel/runtime', 'tslib']
		},
		test: {
			environment: 'jsdom',
			globals: true,
			transformMode: {
				web: [/\.[jt]sx?$/],
			},
			include: ['tests/type-metadata/**/*.test.{ts,tsx}'],
			exclude: ['**/node_modules/**'],
			server: {
				deps: {
					inline: ['@babel/runtime', 'tslib', '@vue/test-utils', 'vue', '@vue/runtime-core', '@vue/runtime-dom']
				},
			}
		},
	};
});
