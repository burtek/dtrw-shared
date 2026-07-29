import { defineConfig } from 'tsdown';


export default defineConfig({
    entry: ['src/**/*.ts', '!src/**/*.test.ts'],
    tsconfig: 'tsconfig.code.json',
    clean: true,
    dts: { cjsReexport: true },
    sourcemap: true,
    exports: {
        customExports(pkg, _context) {
            const knownKeys = ['require', 'import'] as const;

            for (const entry in pkg) {
                // eslint-disable-next-line
                if (entry === './package.json') continue;
                const def = pkg[entry] as unknown;
                assertObject(def, entry);
                assertPathExport(def, entry, knownKeys);
                knownKeys.forEach(key => {
                    if (typeof def[key] !== 'string') {
                        throw new Error(`Invalid export definition for entry "${entry}[${key}]": expected a string`);
                    }
                    def[key] = {
                        types: def[key].replace(/\.([mc])js$/, '.d.$1ts'),
                        default: def[key]
                    };
                });
            }

            return pkg;
        }
    },
    format: ['esm', 'cjs']
});

function assertObject(value: unknown, entry: string): asserts value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null) {
        throw new Error(`Invalid export definition for entry "${entry}": expected an object`);
    }
}
function assertPathExport<T extends string>(
    def: Record<string, unknown>, entry: string, knownKeys: readonly T[]
): asserts def is Record<T, string | { types: string; default: string }> {
    if (Object.keys(def).length !== knownKeys.length || knownKeys.some(k => !(k in def))) {
        throw new Error(`Invalid export definition for entry "${entry}": ${Object.keys(def).join(',')}`);
    }
}
