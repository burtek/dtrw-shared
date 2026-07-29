# DTRW Utils

A collection of reusable TypeScript libraries shared across DTRW projects.

Each package is published independently and follows Semantic Versioning.

## Packages

| Package                                         | Description                                   | Status            |
| ----------------------------------------------- | --------------------------------------------- | ----------------- |
| [`@dtrw/fastify`](./packages/fastify/README.md) | Shared Fastify utilities, plugins and helpers | 🚧 In development |

## Goals

* Small, focused packages
* TypeScript-first
* ESM-only
* Minimal runtime dependencies
* Well-tested
* Independently versioned
* Reusable across multiple projects

## Repository Structure

```text
packages/
├── fastify-shared/
└── ...
```

## Development

Install dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Lint:

```bash
pnpm lint
```

## Releasing

Packages are versioned and published independently.

See the individual package documentation for usage and API details.

## License

MIT
