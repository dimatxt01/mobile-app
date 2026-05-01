const { defineConfig } = require('eslint/config');
const expoFlat = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  ...expoFlat,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
    ignores: ['node_modules/', 'dist/', '.expo/'],
  },
]);
