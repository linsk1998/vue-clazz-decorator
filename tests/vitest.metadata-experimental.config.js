import inject from "@rollup/plugin-inject";
import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { defineConfig } from 'vite';
import sky from '../node_modules/sky-core/createRollupPlugin';

export default defineConfig(function({ command, mode }) {

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
			typescript({
				compilerOptions: {
					experimentalDecorators: true,
					emitDecoratorMetadata: true,
					useDefineForClassFields: false,
					importHelpers: true,
				},
				transformers: (program) => ({
					before: [
						require("typescript-plugin-mark-fields")(program, {})
					]
				})
			}),
			vue(),
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
			transformMode: {
				web: [/\.[jt]sx$/],
			},
			include: ['tests/type-metadata/**/*.test.{ts,tsx}'],
			exclude: ['**/node_modules/**'],
			server: {
				deps: {
					inline: ['@babel/runtime', 'tslib']
				},
			}
		},
	};
});
