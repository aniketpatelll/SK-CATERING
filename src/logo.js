// Finds the logos in src/assets. Which file is used for each place is set in data/logos.json
// (file name with or without the extension). A missing file can no longer crash the app.
import names from "./data/logos.json";

const files = import.meta.glob("./assets/*.{png,jpg,jpeg,svg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

const list = Object.entries(files).map(([path, url]) => {
  const file = path.split("/").pop().toLowerCase();
  return { file, stem: file.replace(/\.[^.]+$/, ""), url };
});

const byName = (name) => {
  const n = String(name ?? "").trim().toLowerCase();
  return n ? list.find((f) => f.file === n || f.stem === n) : undefined;
};

// Sidebar logo: the file in logos.json -> any file with "logo" in its name -> any image except the Vite/React starter icons
const navbar =
  byName(names.navbar) ??
  list.find((f) => f.stem.includes("logo")) ??
  list.find((f) => !/^(react|vite)$/.test(f.stem));

// Login page logo: its own file from logos.json, otherwise it reuses the sidebar logo
const login = byName(names.login);

export const navbarLogo = navbar ? navbar.url : null;
export const loginLogo = login ? login.url : navbarLogo;
export const loginLogoIsOwn = Boolean(login);
