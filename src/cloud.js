// Talks to a Supabase database so billing history is the same on every device.
// Fill in data/cloud.json. While it is empty, orders stay on this device only.
import cfg from "./data/cloud.json";

const URL = String(cfg.url || "").trim().replace(/\/+$/, "");
const KEY = String(cfg.key || "").trim();

export const cloudEnabled = Boolean(URL && KEY);

const headers = { apikey: KEY, "Content-Type": "application/json" };
if (KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${KEY}`; // older "anon" keys are JWTs

async function call(path, init = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  });
  if (!res.ok) throw new Error(`Cloud error ${res.status}`);
  return res.json().catch(() => null); // writes return an empty body
}

export async function fetchOrders() {
  const PAGE = 1000;
  const all = [];
  for (let from = 0; ; from += PAGE) {
    const rows = await call(`orders?select=data&order=id.desc&limit=${PAGE}&offset=${from}`);
    all.push(...rows.map((r) => r.data));
    if (rows.length < PAGE) break;
  }
  return all;
}

export function pushOrder(order) {
  return call("orders?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ id: order.id, data: order }),
  });
}

export async function deleteOrders(ids) {
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    await call(`orders?id=in.(${chunk.join(",")})`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  }
}
