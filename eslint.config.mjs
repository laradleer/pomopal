// @ts-check
import prettier from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

// Formatting is Prettier's job; ESLint only checks code quality.
export default withNuxt().append(prettier)
