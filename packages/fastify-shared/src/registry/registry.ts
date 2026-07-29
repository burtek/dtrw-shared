import type { FastifyInstance, FastifyPluginCallback } from 'fastify';


const kPluginMeta = Symbol.for('plugin-meta');

interface PluginEntry {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin: FastifyPluginCallback<any>;
    opts?: unknown;
    name: string;
    dependencies: string[];
}

interface PluginMeta {
    name: string;
    dependencies?: string[];
}

function assertHasMeta(plugin: object): asserts plugin is { [kPluginMeta]: PluginMeta } {
    if (!(kPluginMeta in plugin)
        || typeof plugin[kPluginMeta] !== 'object'
        || plugin[kPluginMeta] === null
    ) {
        throw new Error('Fastify plugin is missing metadata. Did you forget to wrap it with fp()?');
    }

    if (!('name' in plugin[kPluginMeta])
        || typeof plugin[kPluginMeta].name !== 'string'
    ) {
        throw new Error('Fastify plugin is missing a name in its metadata');
    }

    if ('dependencies' in plugin[kPluginMeta] && plugin[kPluginMeta].dependencies !== undefined) {
        if (!Array.isArray(plugin[kPluginMeta].dependencies)
            || !plugin[kPluginMeta].dependencies.every(dep => typeof dep === 'string')
        ) {
            throw new Error('Fastify plugin dependencies must be an array of strings');
        }
    }
}
function getPluginMeta<T extends Record<string, unknown>>(plugin: FastifyPluginCallback<T>) {
    assertHasMeta(plugin);
    return plugin[kPluginMeta];
}

const EMPTY = 0;
function isEmptySet(set: Set<unknown>): boolean {
    return set.size === EMPTY;
}

function topoSort(entries: PluginEntry[]): PluginEntry[] {
    const byName = new Map<string, PluginEntry>();
    const graph = new Map<string, Set<string>>(); // name -> deps

    for (const e of entries) {
        byName.set(e.name, e);
    }

    for (const e of entries) {
        const deps = e.dependencies.filter(d => byName.has(d));
        graph.set(e.name, new Set(deps));
    }

    const result: PluginEntry[] = [];
    const ready = [...graph.entries()]
        .filter(([, deps]) => isEmptySet(deps))
        .map(([name]) => name);

    while (ready.length) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const name = ready.pop()!;
        const entry = byName.get(name);
        if (entry) {
            result.push(entry);
        }

        for (const [n, deps] of graph) {
            if (deps.delete(name) && isEmptySet(deps)) {
                ready.push(n);
            }
        }
    }

    const unresolved = [...graph.values()].some(d => !isEmptySet(d));
    if (unresolved) {
        throw new Error('Fastify plugin dependency cycle detected');
    }

    return result;
}

export function createPluginRegistry(fastify: FastifyInstance): Registry {
    let registered = false;
    const entries: PluginEntry[] = [];

    const registry: Registry = {
        use<T extends Record<string, unknown>>(plugin: FastifyPluginCallback<T>, opts?: T): Registry {
            if (registered) {
                throw new Error('Cannot add new plugins after registerAll has been called');
            }

            const { name, dependencies = [] } = getPluginMeta(plugin);

            if (entries.some(e => e.name === name)) {
                throw new Error(`Plugin with name "${name}" has already been registered`);
            }

            entries.push({ plugin, opts, name, dependencies });

            return registry;
        },
        registerAll() {
            if (registered) {
                throw new Error('registerAll has already been called');
            }
            registered = true;
            const ordered = topoSort(entries);

            for (const { plugin, opts } of ordered) {
                fastify.register(plugin, opts);
            }
        }
    };

    return registry;
}

interface Registry {
    use: <T extends Record<string, unknown>>(plugin: FastifyPluginCallback<T>, opts?: T) => Registry;
    registerAll: () => void;
}
