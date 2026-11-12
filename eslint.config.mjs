// @ts-check
// Lint rules that enforce docs/05-conventions.md. Formatting is Prettier's job.
import prettier from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

const fetchCalls = '/^(\\$fetch|useFetch|useLazyFetch|useAsyncData|useLazyAsyncData)$/'

export default withNuxt(
  // All TypeScript and Vue code
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // Vue files: one component style
  {
    files: ['**/*.vue'],
    rules: {
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'] },
      ],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        { registeredComponentsOnly: false },
      ],
      // Design tokens only: no arbitrary colour classes, no static inline styles.
      'vue/no-restricted-class': ['error', '/\\[(#|rgb|hsl|oklch)/'],
      'vue/no-static-inline-styles': 'error',
    },
  },

  // Components, pages and layouts never fetch data themselves.
  {
    files: ['app/components/**', 'app/pages/**', 'app/layouts/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `CallExpression[callee.name=${fetchCalls}]`,
          message:
            'Load data in a composable (app/composables) or a store action, not here. See docs/05-conventions.md.',
        },
      ],
    },
  },

  // API handlers stay thin: no database access.
  {
    files: ['server/api/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['drizzle-orm', 'drizzle-orm/*', '~~/server/db/*'],
              message: 'Handlers call services. Move database code into server/services.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useDb']",
          message: 'Handlers call services. Move database code into server/services.',
        },
      ],
    },
  },

  // Game rules are pure functions: no database, no HTTP, no hidden clock.
  {
    files: ['server/services/rules/**'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'drizzle-orm',
                'drizzle-orm/*',
                'h3',
                '~~/server/*',
                '~~/server/**',
                '#imports',
              ],
              message: 'Rules are pure. Do I/O in the service that calls the rule.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `CallExpression[callee.name=/^(useDb|apiError|createError|\\$fetch)$/]`,
          message: 'Rules are pure: return a result, let the service do I/O and throw errors.',
        },
        {
          selector:
            "CallExpression[callee.object.name='Date'][callee.property.name='now'], NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'Pass the current time in as a parameter so the rule stays pure and testable.',
        },
      ],
    },
  },
).append(prettier)
