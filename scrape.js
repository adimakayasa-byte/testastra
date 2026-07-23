#!/usr/bin/env node
/**
 * scrape.js — Ambil data produk Aki dari shopanddrive.com dan tulis ke products.json
 *
 * Jalankan di mesin Anda (butuh akses internet ke shopanddrive.com):
 *   node scrape.js
 *
 * Catatan: struktur HTML situs bisa berubah sewaktu-waktu. Kalau hasilnya kosong,
 * sesuaikan selektor di fungsi parseProducts() sesuai markup terbaru situs.
 * Node 18+ sudah punya fetch bawaan.
 */

const fs = require("fs");

const CATEGORY = "Aki";
const URL = "https://www.shopanddrive.com/produk?category=" + encodeURIComponent(CATEGORY);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function main() {
  console.log("Mengambil:", URL);
  const res = await fetch(URL, { headers: { "User-Agent": UA, "Accept-Language": "id-ID,id" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const html = await res.text();

  let products = parseNextData(html);
  if (!products.length) products = parseProducts(html);

  if (!products.length) {
    console.warn(
      "\n⚠️  Tidak ada produk terdeteksi. Kemungkinan datanya dimuat via API/JS.\n" +
      "   Buka DevTools > Network di browser, cari request JSON produk, lalu\n" +
      "   sesuaikan URL/selektor di file ini.\n"
    );
  }

  const out = {
    category: CATEGORY,
    source: URL,
    scrapedAt: new Date().toISOString(),
    products: products,
  };
  fs.writeFileSync("products.json", JSON.stringify(out, null, 2));
  console.log("✅ Tersimpan " + products.length + " produk ke products.json");
}

/** Coba baca dari blob __NEXT_DATA__ (situs berbasis Next.js). */
function parseNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return [];
  try {
    const json = JSON.parse(m[1]);
    const found = [];
    // Cari array objek yang punya field mirip produk secara rekursif
    (function walk(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      const name = node.name || node.title || node.product_name;
      const price = node.price || node.harga || node.price_formatted;
      if (name && (price || node.image || node.image_url || node.thumbnail)) {
        found.push({
          name: String(name).trim(),
          brand: node.brand || node.merk || "",
          price: formatPrice(price),
          sku: node.sku || node.code || node.slug || "",
          image: node.image || node.image_url || node.thumbnail || node.photo || "",
          url: node.url || node.permalink || URL,
          specs: node.description || node.short_description || node.specs || "",
        });
      }
      Object.values(node).forEach(walk);
    })(json);
    return dedupe(found);
  } catch (_) {
    return [];
  }
}

/** Fallback: parsing kasar dari markup kartu produk. Sesuaikan bila perlu. */
function parseProducts(html) {
  const products = [];
  const cardRe = /<a[^>]+href="([^"]*produk[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const href = m[1];
    const inner = m[2];
    const img = (inner.match(/<img[^>]+src="([^"]+)"/i) || [])[1];
    const name = clean((inner.match(/alt="([^"]+)"/i) || [])[1] || (inner.match(/>([^<]{6,80})</) || [])[1]);
    const price = clean((inner.match(/Rp[\s.]*[\d.]+/i) || [])[0]);
    if (name && img) {
      products.push({ name, brand: "", price: price || "", sku: "", image: img, url: abs(href), specs: "" });
    }
  }
  return dedupe(products);
}

function formatPrice(p) {
  if (p == null) return "";
  if (typeof p === "number") return "Rp " + p.toLocaleString("id-ID");
  return String(p).trim();
}
function clean(s) { return (s || "").replace(/\s+/g, " ").trim(); }
function abs(href) { return href && href.startsWith("http") ? href : "https://www.shopanddrive.com" + href; }
function dedupe(arr) {
  const seen = new Set();
  return arr.filter(function (p) {
    const k = (p.name + "|" + p.image).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

main().catch(function (e) {
  console.error("❌ Gagal:", e.message);
  process.exit(1);
});
