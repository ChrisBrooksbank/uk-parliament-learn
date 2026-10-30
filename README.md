# UK Parliament Learn

**Live demo:** [uk-parliament-learn.netlify.app](https://uk-parliament-learn.netlify.app)

Educational PWA about UK Parliament and political systems

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start development server  |
| `npm run build`         | Production build          |
| `npm run preview`       | Preview production build  |
| `npm test`              | Run tests in watch mode   |
| `npm run test:run`      | Run tests once            |
| `npm run test:coverage` | Generate coverage report  |
| `npm run lint`          | Check for lint errors     |
| `npm run lint:fix`      | Fix lint errors           |
| `npm run format`        | Format code with Prettier |
| `npm run typecheck`     | TypeScript type checking  |
| `npm run knip`          | Find unused code          |
| `npm run check`         | Run all checks            |

## Project Structure

```
src/
├── main.ts          # Application entry point
├── main.test.ts     # Example test
├── api/             # External API clients
├── core/            # Core business logic
├── config/          # Zod-validated configuration
├── utils/           # Logger and helper utilities
└── types/           # Shared type definitions
```

## License

MIT
