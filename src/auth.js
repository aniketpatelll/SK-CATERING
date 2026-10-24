import users from "./data/users.json";

// NOTE: this keeps people out of the screens, but it runs in the browser, so it is
// not real security. Anyone who can open the app files can read users.json.
// For real protection the check has to happen on a server.
const KEY = "ajs-user";

export function checkLogin(username, password) {
  const name = username.trim().toLowerCase();
  const user = users.find((u) => u?.username?.toLowerCase() === name && u.password === password);
  return user ? { username: user.username, name: user.name || user.username } : null;
}

export function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* storage blocked: you stay signed in until the page is refreshed */
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
