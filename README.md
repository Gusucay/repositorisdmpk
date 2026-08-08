# REPOSITORI PERSONAL PUSBANGKOM SDMPK

Versi gratis, ringan, profesional, dan siap dipublikasikan dengan GitHub Pages.

## 7 kategori
1. Modul
2. Kurikulum
3. SOP
4. Pedoman
5. Juknis
6. Juklak
7. Sertifikat Pelatihan

## Cara paling mudah agar ONLINE gratis
1. Buat akun GitHub.
2. Buat repository baru, misalnya `repositori-sdmpk`.
3. Upload `index.html`, `styles.css`, dan `app.js`.
4. Masuk Settings → Pages.
5. Source: Deploy from a branch.
6. Pilih branch `main`, folder `/root`.
7. Simpan.
8. GitHub akan memberikan alamat:
   `https://USERNAME.github.io/repositori-sdmpk/`

## Penyimpanan file gratis
Website ini memisahkan katalog dari file. Untuk file publik, gunakan link berbagi dari layanan storage yang Anda miliki (mis. Google Drive/OneDrive/Dropbox) lalu masukkan link tersebut ke kolom `Public File URL`.

Penting:
- Jangan menaruh password, API key rahasia, atau token admin di file frontend.
- Jika ingin upload langsung dari website dan semua pengunjung dapat mengakses file, gunakan backend/storage seperti Supabase. Versi ini sengaja tidak menyimpan file binary di browser karena localStorage tidak cocok untuk repositori publik.
- File lokal pada form hanya untuk memilih file; agar publik, tetap perlu Public File URL.

## Fitur
- 7 kategori
- Search
- Filter kategori/tahun
- Detail dokumen
- Link download/buka
- Katalog tersimpan di browser
- Export/Import katalog JSON
- Responsive
- GitHub Pages ready

## Jalur upgrade
GitHub Pages → Supabase Free → Auth Admin → Storage → Database → Upload PDF → QR Verification Sertifikat.
