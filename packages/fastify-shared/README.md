# @dtrw/fastify

Shared Fastify utilities used across the DTRW ecosystem.

> **Status:** 🚧 Work in progress. APIs may change until the first stable release.

## Table of Contents

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)

  * [Services registry](#services-registry)
  * [Authelia plugin](#authelia-plugin)
  * [Node Mailer plugin](#node-mailer-plugin)
* [Peer Dependencies](#peer-dependencies)
* [Development](#development)
* [Versioning](#versioning)
* [License](#license)

## Features

* Common Fastify plugins
* Shared decorators
* Hooks
* Error handling utilities
* Validation helpers
* Request/response utilities
* TypeScript-first
* ESM-only

## Installation

```bash
pnpm add @dtrw/fastify-shared
```

## Usage

### Services registry

```ts
import { createPluginRegistry } from '@dtrw/fastify-shared/registry/registry';

const app = fastify();
const registry = createPluginRegistry(app);

// All used plugins MUST be wrapped with fastify-plugin,
// have name and dependencies specified.
registry
    .use(someService)
    .use(someOtherService)
    .use(someController, { prefix: '/prefix' })
    .registerAll();
```

### Authelia plugin

```ts
import { createAuthDecorator } from '@dtrw/fastify-shared/plugins/authelia';

const app = fastify();
const auth = createAuthDecorator();

app.register(auth);

// Requests will have:
req.user?: {
    username: string;
    groups?: string[];
};
```

### Node Mailer plugin

```ts
import { createMailerPlugin } from '@dtrw/fastify-shared/plugins/mailer';

const app = fastify();

const mailer = createMailerPlugin(
    'gmail_username',
    'gmail_password',
    'From Name <email@example.com>',
);

app.register(mailer);

await app.mailer.sendMail(mailObjectForNodeMailer);
```

## Peer Dependencies

* Fastify v5+
* fastify-plugin v5+

## Development

Install dependencies:

```bash
pnpm install
```

Build:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

## Versioning

This package follows Semantic Versioning.

## License

MIT
