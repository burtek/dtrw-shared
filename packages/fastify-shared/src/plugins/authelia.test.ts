import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { fastify } from 'fastify';

import { createAuthDecorator, provides } from './authelia.js';


describe('Authelia plugin', () => {
    let app: FastifyInstance;

    beforeEach(() => {
        app = fastify();
        app.register(createAuthDecorator());
    });

    afterEach(async () => {
        await app.close();
    });

    const username = 'testuser';
    const groups = 'group1,group2';

    it('should add user info to request when headers are present', async () => {
        const controller: FastifyPluginCallback = (instance, options, done) => {
            instance.get('/test', (request, reply) => {
                expect(request).toHaveProperty(provides.requestDecorators[0]);
                expect(request[provides.requestDecorators[0]]).toStrictEqual({
                    username,
                    groups: groups.split(',')
                });

                reply.send({ success: true });
            });
            done();
        };
        app.register(controller);

        const response = await app.inject({
            method: 'GET',
            url: '/test',
            headers: {
                'remote-user': username,
                'remote-groups': groups
            }
        });

        expect.assertions(4);

        expect(response.statusCode).toBe(200);
        expect(response.json()).toStrictEqual({ success: true });
    });

    it('should add undefined user info to request when headers are missing', async () => {
        const controller: FastifyPluginCallback = (instance, options, done) => {
            instance.get('/test', (request, reply) => {
                expect(request).toHaveProperty(provides.requestDecorators[0]);
                expect(request[provides.requestDecorators[0]]).toBeUndefined();

                reply.send({ success: true });
            });
            done();
        };
        app.register(controller);

        const response = await app.inject({
            method: 'GET',
            url: '/test'
        });

        expect.assertions(4);

        expect(response.statusCode).toBe(200);
        expect(response.json()).toStrictEqual({ success: true });
    });
});
