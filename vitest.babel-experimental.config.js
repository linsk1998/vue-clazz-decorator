import { babel } from "@rollup/plugin-babel";
import inject from "@rollup/plugin-inject";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { defineConfig } from 'vite';
import sky from './node_modules/sky-core/createRollupPlugin';

export default defineConfig(function({ command, mode }) {
	var babelRuntimePath = require.resolve("@babel/runtime/package.json", {
		paths: [process.cwd()]
	});
	var babelRuntimePackage = require(babelRuntimePath);
	var babelRuntimeVersion = babelRuntimePackage.version;

	return {
		resolve: {
			alias: {
				'@': path.resolve(__dirname, "./src")
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
						["babel-plugin-transform-typescript-decorators", {
							experimentalDecorators: true
						}],
						require("./scripts/babel-plugin-remove-shadowed"),
						["@babel/plugin-transform-typescript", {
							allowNamespaces: true,
							allowDeclareFields: true,
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
			vue(),
			vueJsx({
				include: /\.(j|t)sx$/
			}),
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
				web: [/\.[jt]sx$/],
			},
			include: ['tests/**/*.test.{js,ts,jsx,tsx}'],
			exclude: ['tests/metadata/proposal.test.ts'],
		},
	};
});
