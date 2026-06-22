const { nodeResolve } = require("@rollup/plugin-node-resolve");
const inject = require("@rollup/plugin-inject");
const vue = require("@vitejs/plugin-vue");
const vueJsx = require("@vitejs/plugin-vue-jsx");
const path = require("path");
const { defineConfig } = require('vite');
const sky = require('../node_modules/sky-core/createRollupPlugin');

module.exports = defineConfig(function({ command, mode }) {
	var transformer;
		switch(mode) {
		case "babel":
			transformer = require("./babel");
			break;
		default:
			transformer = require("./typescript");
			break;
	}

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
			transformer({
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
			}),
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
			}),
		],
		optimizeDeps: {
			include: [],
			exclude: ['sky-core', '@babel/runtime', 'tslib']
		},
		test: {
			environment: 'jsdom',
			globals: true,
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
