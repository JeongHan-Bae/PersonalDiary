import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const normalizeBasePath = (basePath: string | undefined): string => {
  if (basePath === undefined || basePath.trim() === '') {
    return '/';
  }

  const trimmedBasePath = basePath.trim();
  const leadingSlashBasePath = trimmedBasePath.startsWith('/')
    ? trimmedBasePath
    : `/${trimmedBasePath}`;

  return leadingSlashBasePath.endsWith('/')
    ? leadingSlashBasePath
    : `${leadingSlashBasePath}/`;
};

const productionBasePath = normalizeBasePath(process.env.VITE_BASE_PATH);

export default defineConfig(({ command }) => ({
  base: command === 'build' ? productionBasePath : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}));
