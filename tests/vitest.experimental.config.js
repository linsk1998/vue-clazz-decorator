const { nodeResolve } = require("@rollup/plugin-node-resolve");
const inject = require("@rollup/plugin-inject");
const typescript = require("@rollup/plugin-typescript");
const vue = require("@vitejs/plugin-vue");
const vueJsx = require("@vitejs/plugin-vue-jsx");
const path = require("path");
const { defineConfig } = require('vite');
const sky = require('../node_modules/sky-core/createRollupPlugin');

module.exports = defineConfig(function({ command, mode }) {

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
			(function() {
				let plugin = nodeResolve({
					browser: true
				});
				plugin.resolveId.order = undefined;
				plugin.enforce = "pre";
				return plugin;
			})(),
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
		typescript({
			compilerOptions: {
				experimentalDecorators: true,
				useDefineForClassFields: false,
			},
			transformers: (program) => ({
				before: [
					require("typescript-plugin-mark-fields")(program, {})
				]
			})
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
			transformMode: {
				web: [/\.[jt]sx$/],
			},
			include: ['tests/**/*.test.{js,jsx,tsx,tsx}'],
			exclude: ['tests/metadata/proposal.test.js', 'tests/type-metadata/**', '**/node_modules/**'],
			server: {
				deps: {
					inline: ['@babel/runtime', 'tslib', '@vue/test-utils', 'vue', '@vue/runtime-core', '@vue/runtime-dom']
				},
			}
		},
	};
});
