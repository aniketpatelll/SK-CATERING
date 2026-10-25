import { saveFile } from "./saveFile";

// Saves orders as a Word file with a table. No extra package needed:
// Word, LibreOffice and Google Docs all open this format.
const money = (n) => `₹${Number(n).toFixed(2)}`;
const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildWordHtml(orders, title = "SK Catering - Order History") {
  const total = orders.reduce((s, o) => s + o.total, 0);
  const hasTax = orders.some((o) => o.tax > 0); // older orders only: then Subtotal + GST columns are shown

  const rows = orders
    .map((o) => {
      const who =
        o.source === "Railway"
          ? `${esc(o.train?.id)} ${esc(o.train?.name)}<br/>${esc(o.train?.from)} to ${esc(o.train?.to)}` +
            `${o.station ? `<br/>Station: ${esc(o.station)}` : ""}` +
            `${o.date ? `<br/>Journey ${esc(o.date)}` : ""}` +
            `${o.seat ? ` · ${esc(o.seat)}` : ""}` +
            `${o.vendor ? `<br/>Vendor: ${esc(o.vendor)}` : ""}`
          : `${esc(o.customer)}${o.orderType ? `<br/>${esc(o.orderType)}` : ""}`;
      const items = o.items.map((i) => `${i.qty} × ${esc(i.name)}`).join("<br/>");
      return `<tr>
        <td>#${o.number}</td>
        <td>${esc(when(o.createdAt))}</td>
        <td>${esc(o.source)}</td>
        <td>${who}</td>
        <td>${items}</td>
        ${hasTax ? `<td class="r">${money(o.subtotal)}</td><td class="r">${money(o.tax || 0)}</td>` : ""}
        <td class="r"><b>${money(o.total)}</b></td>
      </tr>`;
    })
    .join("");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:w="urn:schemas-microsoft-com:office:word"
  xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  @page WordSection1 { size: 841.9pt 595.3pt; mso-page-orientation: landscape; margin: 36pt; }
  div.WordSection1 { page: WordSection1; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
  h1 { color: #DA291C; font-size: 20pt; margin: 0 0 4pt; }
  p.meta { color: #6f6f6f; margin: 0 0 12pt; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #DA291C; color: #ffffff; text-align: left; padding: 5pt; border: 1pt solid #b01e13; }
  td { padding: 5pt; border: 1pt solid #cccccc; vertical-align: top; }
  td.r, th.r { text-align: right; }
  tr.total td { background: #FFC72C; font-weight: bold; }
</style>
</head>
<body>
<div class="WordSection1">
  <h1>${esc(title)}</h1>
  <p class="meta">Created ${esc(when(new Date().toISOString()))} · ${orders.length} order${orders.length === 1 ? "" : "s"}</p>
  <table border="1" cellpadding="5" cellspacing="0" width="100%" style="border-collapse:collapse;border-color:#cccccc">
    <thead>
      <tr>
        <th bgcolor="#DA291C">Order</th><th bgcolor="#DA291C">Date</th><th bgcolor="#DA291C">Type</th><th bgcolor="#DA291C">Customer / Train</th>
        <th bgcolor="#DA291C">Items</th>${hasTax ? `<th bgcolor="#DA291C" class="r">Subtotal</th><th bgcolor="#DA291C" class="r">GST (5%)</th>` : ""}<th bgcolor="#DA291C" class="r">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total">
        <td colspan="${hasTax ? 7 : 5}" bgcolor="#FFC72C">Grand total</td>
        <td class="r" bgcolor="#FFC72C">${money(total)}</td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>`;
}

export function exportWord(orders, station = "") {
  const title = station
    ? `SK Catering - Order History - ${station}`
    : "SK Catering - Order History";
  const part = station ? `-${station.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}` : "";
  const html = "\ufeff" + buildWordHtml(orders, title);
  return saveFile(
    new Blob([html], { type: "application/msword" }),
    `sk-order-history${part}-${new Date().toLocaleDateString("en-CA")}.doc`,
    "Word document",
    "application/msword",
    ".doc"
  );
}
