import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    entry: ['src/main.ts', 'src/types/index.ts'],
    project: ['src/**/*.ts'],
};

export default config;
