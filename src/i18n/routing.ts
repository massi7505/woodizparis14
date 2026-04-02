import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'it', 'es'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});
