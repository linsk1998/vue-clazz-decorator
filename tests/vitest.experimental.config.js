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
				'@': path.resolve(__dirname, "../src")
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
				emitDecoratorMetadata: false,
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
			include: ['tests/**/*.test.{js,ts,jsx,tsx}'],
			exclude: ['tests/metadata/proposal.test.*', 'tests/type-metadata/**', '**/node_modules/**'],
			server: {
				deps: {
					inline: ['@babel/runtime', 'tslib', '@vue/test-utils', 'vue', '@vue/runtime-core', '@vue/runtime-dom']
				},
			}
		},
	};
});
