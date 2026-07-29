import type { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';


const NAME = 'auth-plugin';
const DECORATOR = 'user';

export interface AutheliaAuthInfo {
    username: string;
    groups: string[];
}

export const createAuthDecorator = () => {
    const plugin: FastifyPluginCallback = (app, options, done) => {
        app.addHook('preHandler', (request, reply, handlerDone) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const username = request.headers['remote-user'] as string | undefined;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const groupsHeader = request.headers['remote-groups'] as string | undefined;

            request[DECORATOR] = username
                ? {
                    username,
                    groups: groupsHeader?.split(',').map(g => g.trim()) ?? []
                }
                : undefined;

            handlerDone();
        });

        done();
    };
    return fp(plugin, { name: NAME });
};

declare module 'fastify' {
    interface FastifyRequest {
        [DECORATOR]?: AutheliaAuthInfo;
    }
}

export const provides = {
    name: NAME,
    requestDecorators: [DECORATOR]
} as const;
