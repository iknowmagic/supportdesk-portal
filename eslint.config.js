import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', '.history', 'src/components/ui/**', 'src/components/shadcn-studio/**', '**/*.md', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-console': 'error',
      'no-restricted-globals': ['error', 'fetch'],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Disable max-lines for markdown files — md content can be long but config
    // should not flag pages or docs.
    files: ['**/*.md'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    files: ['**/__tests__/*.test.{ts,tsx}', './tests/**/*.test.{ts,tsx}'],

    rules: {
      'no-console': 'off',
      'no-restricted-globals': 'off',
    },
  },
  {
    // Allow server-side Supabase functions to use global `fetch`.
    files: ['supabase/**', 'supabase/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
]);
