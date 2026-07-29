import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';

import { createPluginRegistry } from './registry.js';


function makePlugin(name: string, dependencies?: string[]): FastifyPluginCallback {
    const plugin: FastifyPluginCallback = (instance, options, done) => {
        done();
    };
    return fp(plugin, { name, dependencies });
}

describe('Plugin registry', () => {
    it('should register plugins in the correct order', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const fastifyMock = { register: vitest.fn() } as unknown as FastifyInstance;

        const registry = createPluginRegistry(fastifyMock);

        const pluginA = makePlugin('pluginA');
        const pluginB = makePlugin('pluginB', ['pluginA']);
        const pluginC = makePlugin('pluginC', ['pluginB']);

        registry.use(pluginC);
        registry.use(pluginA);
        registry.use(pluginB);
        registry.registerAll();

        expect(fastifyMock.register).toHaveBeenCalledTimes(3);
        expect(fastifyMock.register).toHaveBeenNthCalledWith(1, pluginA, undefined);
        expect(fastifyMock.register).toHaveBeenNthCalledWith(2, pluginB, undefined);
        expect(fastifyMock.register).toHaveBeenNthCalledWith(3, pluginC, undefined);
    });

    it('should throw an error if there is a dependency cycle', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const fastifyMock = { register: vitest.fn() } as unknown as FastifyInstance;

        const registry = createPluginRegistry(fastifyMock);

        const pluginA = makePlugin('pluginA', ['pluginB']);
        const pluginB = makePlugin('pluginB', ['pluginA']);

        registry.use(pluginA);
        registry.use(pluginB);

        expect(() => {
            registry.registerAll();
        }).toThrow('Fastify plugin dependency cycle detected');
    });
});
