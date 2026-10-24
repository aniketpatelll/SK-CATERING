// Makes image paths from the JSON files work on GitHub Pages.
// A path like "/stations/a.jpg" ignores the repository folder (https://you.github.io/REPO/),
// so the picture is not found. withBase() adds the right prefix for every host.
const BASE = import.meta.env.BASE_URL ?? "/";

export function withBase(path) {
  if (!path || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path; // http:, data:, blob: ... stay as they are
  return BASE + path.replace(/^\.?\//, "");
}
