import js from '@eslint/js'
import globals from 'globals'
import security from 'eslint-plugin-security'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['node_modules']), //don't lint installed dependencies.
  {
    files: ['**/*.js'], //apply this config to all .js files in the backend.
    plugins: { security },
    extends: [
      js.configs.recommended,
    ],
    rules: {
      ...security.rules && Object.fromEntries( //this block - auto-enables every rule from eslint-plugin-security as a warn, same pattern as the client config.
        Object.keys(security.rules).map((rule) => [`security/${rule}`, 'warn'])
      ),
    },
    languageOptions: {
      globals: globals.node, //tells ESLint that process, __dirname, etc. are valid (Node built-ints), not undefined variables.
      sourceType: 'commonjs', // matches the "type": "commonjs" in package.json, so ESLint expects require()/module.exports, not import/export.
    },
  },
])