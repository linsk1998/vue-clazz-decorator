const alias = require("@rollup/plugin-alias");
const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const path = require('path');

const pkg = require('./package.json');
const external = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.peerDependencies || {})
];
var babelRuntimePath = require.resolve("@babel/runtime/package.json", {
	paths: [process.cwd()]
});
var babelRuntimePackage = require(babelRuntimePath);
var babelRuntimeVersion = babelRuntimePackage.version;

module.exports = {
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
		alias({
			entries: [
				{ find: '@', replacement: path.resolve(__dirname, "src") }
			]
		}),
		nodeResolve({
			extensions: ['.mjs', '.js', '.ts', '.tsx']
		}),
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
					["@babel/plugin-proposal-decorators", {
						version: "2023-11",
						decoratorsBeforeExport: true
					}],
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
	]
};
