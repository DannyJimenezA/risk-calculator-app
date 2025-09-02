import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  Sentry.captureException(error);
  return (
    <html>
      <body>
        <h2>Ha ocurrido un error inesperado</h2>
        <pre>{error.message}</pre>
        <button onClick={() => reset()}>Reintentar</button>
      </body>
    </html>
  );
}
