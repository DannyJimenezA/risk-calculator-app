export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: 1.0,
});

// Captura errores globales en el cliente
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});
