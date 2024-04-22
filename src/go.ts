import { processQuery } from './lib/engine';

const params = new URLSearchParams(window.location.search);
const searchFallback = params.get('searchFallback');
const query = params.get('q');
if (!searchFallback) {
  console.error('No search fallback');
  process.exit(1);
}
processQuery(query ?? '', searchFallback)
  .then((url) => {
    // redirect to the processed url
    window.location.href = url;
  })
  .catch((err) => {
    console.error(err);
  });
