import inject from "@rollup/plugin-inject";
import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { defineConfig } from 'vite';
import sky from './node_modules/sky-core/createRollupPlugin';

export default defineConfig(function({ command, mode }) {

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
			typescript({
				compilerOptions: {
					experimentalDecorators: true,
					useDefineForClassFields: false,
				}
			}),
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
			include: ['tests/**/*.test.{js,jsx,tsx,tsx}'],
			exclude: ['tests/metadata/proposal.test.js'],
		},
	};
});
