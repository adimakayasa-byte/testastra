# Carousel Aki Shop & Drive — untuk Link WhatsApp

Halaman web berisi **carousel produk aki mobil** yang bisa dibagikan lewat link WhatsApp.
Customer tinggal geser kartu, pilih aki yang diinginkan, lalu tekan **Pesan via WhatsApp** —
otomatis membuka chat WA ke toko dengan pesan pesanan sudah terisi.

## Isi

| File | Fungsi |
|------|--------|
| `index.html` | Halaman carousel (siap host / buka langsung) |
| `products.json` | Data produk (nama, harga, gambar, dll). Saat ini **data contoh** |
| `scrape.js` | Script untuk menarik data asli dari shopanddrive.com |

## Cara pakai

### 1. Atur nomor WhatsApp
Buka `index.html`, di bagian `<script>` ubah:
```js
const WA_NUMBER = "62812XXXXXXXX";   // nomor WA tujuan pesanan (format 62..., tanpa + / spasi)
const STORE_NAME = "Shop & Drive";
```

### 2. Isi data produk asli
Data di `products.json` masih **contoh**. Untuk menarik data asli:
```bash
node scrape.js
```
> Perlu Node 18+ dan akses internet ke `shopanddrive.com`.
> Jalankan di komputer Anda — di lingkungan build ini domain tersebut diblokir policy jaringan.

Kalau situs memuat produk lewat API/JS dan hasil scrape kosong, buka **DevTools → Network**
di browser, temukan request JSON produk, lalu sesuaikan selektor di `scrape.js`.
Alternatif: isi `products.json` manual mengikuti format yang ada.

### 3. Host & bagikan ke WhatsApp
Upload folder ini ke hosting statis apa pun (GitHub Pages, Vercel, Netlify, dsb),
lalu bagikan URL-nya di chat/broadcast WhatsApp. WhatsApp akan menampilkan preview
(judul + gambar) dari tag Open Graph di `index.html`.

Contoh cepat cek lokal:
```bash
python3 -m http.server 8080
# buka http://localhost:8080
```

## Format `products.json`
```json
{
  "category": "Aki",
  "products": [
    {
      "name": "Aki GS Astra NS40Z",
      "brand": "GS Astra",
      "price": "Rp 620.000",
      "sku": "NS40Z",
      "image": "https://.../gambar.jpg",
      "url": "https://www.shopanddrive.com/...",
      "specs": "12V 35Ah - untuk mobil kecil"
    }
  ]
}
```

## Catatan
- Data produk contoh **bukan harga resmi** — ganti dengan hasil `scrape.js` sebelum dipublikasikan.
- Ganti `og:image` di `index.html` bila ingin gambar preview WhatsApp khusus.
