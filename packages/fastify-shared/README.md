# @dtrw/fastify

Shared Fastify utilities used across the DTRW ecosystem.

> **Status:** 🚧 Work in progress. APIs may change until the first stable release.

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

// All used plugins MUST be wrapped with fastify-plugin, have name and dependencies specified
registry.use(someService)
        .use(someOtherService)
        .use(someController, { prefix: '/prefix' })
        .registerAll();
```

## Peer Dependencies

* Fastify v5+
* Fastify-Plugin v5+

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
