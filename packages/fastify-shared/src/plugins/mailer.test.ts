import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { fastify } from 'fastify';
import { createTransport } from 'nodemailer';

import { createMailerPlugin, provides } from './mailer.js';


vitest.mock(
    'nodemailer',
    () => ({
        createTransport: vitest.fn().mockReturnValue({
            verify: vitest.fn().mockResolvedValue(true),
            sendMail: vitest.fn().mockResolvedValue({})
        })
    })
);

describe('Mailer plugin', () => {
    let app: FastifyInstance;

    beforeEach(() => {
        app = fastify();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should add user info to request when headers are present', async () => {
        app.register(createMailerPlugin('smtp_user', 'smtp_pass', 'From User <from@example.com>'));

        const controller: FastifyPluginCallback = (instance, options, done) => {
            expect(instance).toHaveProperty(provides.instanceDecorators[0]);
            expect(instance[provides.instanceDecorators[0]]).toBeDefined();

            done();
        };
        app.register(controller);

        await app.ready();

        expect(createTransport).toHaveBeenCalledWith(
            {
                service: 'Gmail',
                auth: {
                    user: 'smtp_user',
                    pass: 'smtp_pass'
                }
            },
            { from: 'From User <from@example.com>' }
        );

        expect.assertions(3);
    });
});
