import { readdirSync, readFileSync } from 'node:fs';

const packages = readdirSync('packages', { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((pkg) => ({
        directory: pkg.name,
        // name: JSON.parse(readFileSync(`packages/${pkg.name}/package.json`, 'utf-8')).name
    }));

const packageTypes = new Set([
    'feat',
    'fix',
    'perf',
    'refactor',
    'test',
    'docs',
]);

const repoTypes = new Set([
    'chore',
    'ci',
    'release',
]);

export default {
    extends: ['@commitlint/config-conventional'],

    plugins: [{
        rules: {
            'scope-by-type'({ type, scope }) {
                const scopes = scope && scope.split('.');

                if (packageTypes.has(type)) {
                    if (!scope) {
                        return [false,`"${type}" commits require a package scope.`];
                    }

                    for (const scope of scopes) {
                        if (!packages.some(pkg => scope === pkg.directory)) {
                            return [false, `"${scope}" is not a valid package.`];
                        }
                    }

                    return [true];
                }

                if (repoTypes.has(type)) {
                    if (scope) {
                        return [false,`"${type}" commits must not specify a scope.`];
                    }

                    return [true];
                }

                return [false, `"${type}" is not a valid commit type.`];
            },
        }
    }],
    rules: {
        'scope-by-type': [2, 'always'],
    }
};
