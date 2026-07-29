import type { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import * as mailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';


const NAME = 'mailer-plugin';
const DECORATOR = 'mailerProvider';

class MailerProvider {
    private readonly transport: mailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

    constructor(
        private readonly smtpUser: string,
        private readonly smtpPass: string,
        private readonly from: string
    ) {
        this.transport = mailer.createTransport(
            {
                service: 'Gmail',
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            },
            { from }
        );
    }

    async checkTransporter() {
        await this.transport.verify();
    }

    async sendMail(arg: mailer.SendMailOptions) {
        return await this.transport.sendMail(arg);
    }
}

export const createMailerPlugin = (
    smtpUser: string,
    smtpPass: string,
    from: string
) => {
    const plugin: FastifyPluginCallback = (app, options, done) => {
        const provider = new MailerProvider(smtpUser, smtpPass, from);

        app.decorate(DECORATOR, provider);

        done();
    };
    return fp(plugin, { name: NAME });
};

declare module 'fastify' {
    interface FastifyInstance {
        [DECORATOR]?: MailerProvider;
    }
}

export const provides = {
    name: NAME,
    instanceDecorators: [DECORATOR]
} as const;
