import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'de', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
});
