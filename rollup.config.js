import rollupBabel from 'rollup-plugin-babel';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupCommon from 'rollup-plugin-commonjs';
import autoExternal from 'rollup-plugin-auto-external';
import dts from "rollup-plugin-dts";

const dist = './modules/@themost/mem/dist/';
const name = 'themost_memory';

module.exports = [{
    input: './modules/@themost/mem/src/index.js',
    output: [
        {
            file: `${dist}${name}.cjs.js`,
            format: 'cjs'
        },
        {
            file: `${dist}${name}.esm.js`,
            format: 'esm'
        },
        {
            name: '@themost/memory',
            file: `${dist}${name}.js`,
            format: 'umd'
        }
    ],
    plugins: [
        rollupBabel({
            exclude: [/\/node_modules\//]
        }),
        rollupResolve(),
        rollupCommon(),
        autoExternal()
    ]
}, {
    input: './modules/@themost/mem/src/index.d.ts',
    output: [ { file: `${dist}${name}.d.ts`, format: "es" } ],
    plugins: [dts()],
}];
