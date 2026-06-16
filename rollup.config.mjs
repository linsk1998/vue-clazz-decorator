import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const external = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.peerDependencies || {})
];

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/index.mjs',
			format: 'es',
			generatedCode: "es2015",
			indent: false,
			esModule: false,
			strict: false,
			freeze: false,
			sourcemap: true
		},
		{
			file: 'dist/index.cjs',
			format: 'cjs',
			generatedCode: "es2015",
			indent: false,
			esModule: false,
			strict: true,
			freeze: false,
			sourcemap: true
		}
	],
	external,
	plugins: [
		typescript({
			tsconfig: './tsconfig.build.json'
		})
	]
};
