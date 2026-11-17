/**
 * Front-ends allowed to call this API. Shared by the CORS middleware (governs what a
 * browser lets its own JS read) and the server-side Origin check in index.ts (governs
 * whether the request is answered at all - CORS alone doesn't stop a non-browser client
 * from calling the Worker directly).
 */
export const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://dineshreddy016.com",
  // GitHub Pages serves every project of this account from one origin;
  // the /Portfolio sub-path is not part of an Origin header.
  "https://sanjud1603.github.io",
];
