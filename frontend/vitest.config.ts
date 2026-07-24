import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'cypress/**', 'node_modules/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./tests/setupTests.ts'],
      include: ['src/**/*.{spec,test}.ts', 'tests/**/*.{spec,test}.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/main.ts',
          'src/style.css',
          'src/assets/**',
          'src/components/ui/**',
          'src/**/__tests__/**',
          'tests/**',
        ],
        thresholds: {
          branches: 30,
          functions: 35,
          lines: 40,
          statements: 40,
        },
      },
    },
  }),
)
