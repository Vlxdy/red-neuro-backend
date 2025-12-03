// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.eslintrc.js', 'k6/**'],
  },

  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier,
    },

    rules: {
      // === Reglas equivalentes a tu config anterior ===
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      'no-throw-literal': 'error',
      'no-unused-vars': 'off',
      eqeqeq: ['error', 'always'],
      'require-await': ['warn'],

      // === Prettier ===
      'prettier/prettier': 'error',
    },
    ignores: ['**/*.spec.ts'],
  },
];
