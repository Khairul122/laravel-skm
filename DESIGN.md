# Design Direction: Portal e-SKM (struktur rujukan ikm.sidoarjokab.go.id, identitas hijau)

- **Keputusan pengguna (25 Nov 2026):** susunan halaman mengikuti `ikm.sidoarjokab.go.id` secara penuh, termasuk bagian 9 unsur dan publikasi hasil IKM. Warna **tidak** meniru gradien biru-ungu rujukan, tetapi memakai identitas hijau instansi.
- **Tidak disalin dari rujukan:** logo Pemkab Sidoarjo, gambar, dan teks kontak. Semua aset dibuat sendiri dalam SVG.
- **Dial:** ENERGY 3 / RHYTHM 2 / MOTION 2.

## Struktur halaman `/` (urutan sama dengan rujukan)

| Rujukan Sidoarjo | Versi ini | Sumber data |
|---|---|---|
| Hero gradien + ilustrasi ponsel | `#beranda`: gradien hijau, judul, definisi SKM, tombol Mulai Survei dan Lihat Publikasi, `hero-survei.svg`, gelombang bawah | `agency`, `activePeriods` |
| Tentang & Dasar Hukum | `#tentang`: dua paragraf, 6 kartu regulasi, ilustrasi `tentang-survei.svg` | statis + nama unit |
| Unsur E-SKM (daftar + kartu kutipan) | `#unsur`: 9 unsur dengan bilah nilai rata-rata (1 sampai 4), kartu gradien berisi pengertian + pertanyaan kuesioner. Di HP pengertian muncul di bawah unsur yang diketuk | `elements`, `latestResult.elements` |
| Publikasi IKM (kartu angka) | `#publikasi`: kartu per periode, angka IKM besar, mutu, jumlah responden, tombol Lihat Detail membuka nilai per unsur | `publications` (baru) |
| Survei Kami (3 kartu) | `#survei`: satu kartu per jenis layanan, langsung ke `/kuesioner?periode=..&layanan=..` | `serviceTypes` |
| Ajakan + footer gelombang | `#kontak`: gelombang hijau, ajakan menulis saran lewat kuesioner dan SP4N-LAPOR!, footer 4 kolom | `agency` |

Formulir "Kirim Email" di rujukan tidak ditiru karena aplikasi belum punya kanal email. Gantinya, ajakan diarahkan ke kolom saran di kuesioner.

## Palet

| Peran | Warna | Kontras |
|---|---|---|
| Gradien hero | `#0B3D2E` ke `#1B7A55` | teks putih min. 5,30:1 |
| Hijau utama (tombol, aksen judul) | `#14704F` | putih 6,07:1 |
| Footer dan gelombang kontak | `#105A41` | `#D9EFE3` 6,80:1 |
| Teks utama / sekunder | `#1F2A24` / `#55635B` | 14,84:1 / 6,32:1 |
| Latar bagian selang-seling | `#F3FAF6` | teks sekunder 5,96:1 |
| Aksen kuning (garis judul, ikon kutip) | `#F5B83D` | dekorasi, bukan teks |
| Mode gelap | latar `#0E1712`, kartu `#141F19`, aksen `#A7E3C4` | 12,55:1 |

## Tipografi dan bentuk

- **Plus Jakarta Sans** 400 sampai 800 (sama dengan panel admin). Judul bagian memakai pola rujukan: kata pertama berwarna hijau, sisanya gelap, dua garis pendek di bawahnya.
- Kartu membulat 22 sampai 32 px dengan bayangan lembut dan dekorasi gelombang di sudut, tombol kapsul.

## Gerak

- Hero: teks muncul bertahap, ilustrasi naik dan memudar masuk.
- Bagian lain muncul saat digulir (`MotionReveal`), kartu naik 4 px saat disorot, panel unsur dan detail publikasi berganti atau membuka dengan transisi halus.
- Tidak ada animasi berulang. Semua dimatikan saat `prefers-reduced-motion: reduce`.

## Aset (`public/images/skm/`)

- `hero-survei.svg`: tangan memegang ponsel berisi formulir survei, gelembung bintang, pesawat kertas.
- `tentang-survei.svg`: dua petugas di depan papan data.
- `publikasi-laporan.svg`: dokumen laporan dengan grafik dan tanda centang.
- `logo-loket.svg`, `logo-loket-putih.svg`, `favicon-loket.svg`: lambang jendela loket.
- Aset lama (`stamp-anonim.svg`, PNG gouache) tidak dipakai lagi di beranda.
