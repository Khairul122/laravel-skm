<?php

namespace App\Support\Report;

use App\Models\Agency;
use App\Models\IkmResult;
use App\Models\SurveyPeriod;
use Illuminate\Support\Collection;

class MarkdownReportWriter
{
    /**
     * @param  Collection<int, IkmResult>  $servicesResults
     */
    public function generate(
        SurveyPeriod $period,
        Agency $agency,
        IkmResult $overall,
        Collection $servicesResults,
        string $outputPath
    ): string {
        $elementScores = is_array($overall->element_scores) ? $overall->element_scores : [];
        $weakest = null;
        $strongest = null;

        $elementRows = '';
        foreach ($elementScores as $idx => $el) {
            $conv = (float) ($el['conversion'] ?? 0);
            $grade = $conv >= 88.31 ? 'A' : ($conv >= 76.61 ? 'B' : ($conv >= 65.00 ? 'C' : 'D'));

            if ($weakest === null || (float) $el['nrr'] < (float) $weakest['nrr']) {
                $weakest = $el;
            }
            if ($strongest === null || (float) $el['nrr'] > (float) $strongest['nrr']) {
                $strongest = $el;
            }

            $elementRows .= sprintf(
                "| %d | %s (%s) | %.2f | %.4f | %.2f | %s |\n",
                $idx + 1,
                $el['name'],
                $el['code'],
                (float) $el['nrr'],
                (float) $el['nrr_weighted'],
                $conv,
                $grade
            );
        }

        $serviceRows = '';
        foreach ($servicesResults as $idx => $svc) {
            $name = $svc->serviceType?->name ?? 'Layanan Umum';
            $serviceRows .= sprintf(
                "| %d | %s | %d Orang | %.2f | %s (%s) |\n",
                $idx + 1,
                $name,
                $svc->respondent_count,
                (float) $svc->ikm_score,
                $svc->grade,
                $svc->performance
            );
        }

        $city = $agency->city ?: 'Kota Setempat';
        $date = now()->translatedFormat('d F Y');
        $populasiText = $period->population ? " dengan estimasi populasi sebanyak {$period->population} orang" : '';

        $md = <<<MD
# LAPORAN HASIL SURVEI KEPUASAN MASYARAKAT (SKM)
## {$agency->unit_name}
### {$agency->name}
**Periode Pelaksanaan: {$period->label}**

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang
Penyelenggaraan pelayanan publik yang berkualitas, transparan, dan akuntabel merupakan kewajiban setiap instansi pemerintah sebagaimana diamanatkan dalam Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik dan Permenpan-RB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik. Pengukuran kepuasan masyarakat bertujuan untuk memperoleh gambaran objektif mengenai kualitas pelayanan pada {$agency->name}.

### 1.2 Maksud dan Tujuan
1. Mengetahui tingkat kepuasan masyarakat terhadap pelayanan publik yang diberikan.
2. Mengidentifikasi kelemahan atau kekurangan dari masing-masing unsur pelayanan.
3. Sebagai bahan penetapan kebijakan perbaikan mutu pelayanan publik.

### 1.3 Sembilan Unsur Pelayanan
Ruang lingkup survei meliputi 9 unsur: (1) Persyaratan, (2) Prosedur, (3) Waktu Penyelesaian, (4) Biaya/Tarif, (5) Produk Spesifikasi, (6) Kompetensi Pelaksana, (7) Perilaku Pelaksana, (8) Penanganan Pengaduan, serta (9) Sarana dan Prasarana.

---

## BAB II: PELAKSANAAN SURVEI DAN METODOLOGI

### 2.1 Metode Pengumpulan Data
Pengumpulan data menggunakan kuesioner terstruktur skala Likert 1–4 (1: Tidak Baik, 2: Kurang Baik, 3: Baik, 4: Sangat Baik).

### 2.2 Jumlah Responden dan Kecukupan Sampel
Total data responden valid yang dianalisis berjumlah **{$overall->respondent_count} orang responden**{$populasiText}. Penentuan sampel mengacu pada tabel penentuan ukuran sampel Krejcie dan Morgan.

---

## BAB III: HASIL DAN ANALISIS INDEKS KEPUASAN MASYARAKAT

### 3.1 Nilai IKM Unit Pelayanan

| Parameter | Capaian | Keterangan |
|---|---|---|
| Total Responden | {$overall->respondent_count} Orang | Responden Valid |
| Nilai IKM (Skala 100) | {$overall->ikm_score} | Skala 25 - 100 |
| Mutu Pelayanan | {$overall->grade} | Permenpan-RB 14/2017 |
| Kinerja Unit | {$overall->performance} | Capaian Kinerja |

### 3.2 Rincian Nilai 9 Unsur Pelayanan

| No | Unsur Pelayanan | Nilai Rata-rata (NRR) | NRR Tertimbang (x 1/9) | Konversi (x 25) | Mutu |
|:---:|---|:---:|:---:|:---:|:---:|
{$elementRows}

### 3.3 Analisis Unsur Tertinggi dan Terendah
- **Unsur Tertinggi:** {$strongest['name']} ({$strongest['code']}) dengan skor NRR {$strongest['nrr']} (Konversi: {$strongest['conversion']}).
- **Unsur Terendah (Prioritas Perbaikan):** {$weakest['name']} ({$weakest['code']}) dengan skor NRR {$weakest['nrr']} (Konversi: {$weakest['conversion']}).

### 3.4 Rekapitulasi per Jenis Layanan

| No | Jenis Layanan | Jumlah Responden | Nilai IKM | Mutu & Kinerja |
|:---:|---|:---:|:---:|:---:|
{$serviceRows}

---

## BAB IV: KESIMPULAN DAN TINDAK LANJUT

### 4.1 Kesimpulan
1. Nilai IKM periode {$period->label} mencapai **{$overall->ikm_score}** dengan kategori mutu **{$overall->grade} ({$overall->performance})**.
2. Unsur dengan kepuasan tertinggi: {$strongest['name']}.
3. Unsur prioritas perbaikan: {$weakest['name']}.

### 4.2 Rencana Aksi Tindak Lanjut
1. Evaluasi internal terarah terhadap unsur pelayanan terendah.
2. Peningkatan sarana pendukung dan pembinaan aparatur pelaksana.
3. Pemantauan mandiri berkala menjelang periode survei berikutnya.

---

*Disahkan pada: {$city}, {$date}*  
**{$agency->head_position} {$agency->name}**  

**{$agency->head_name}**  
NIP. {$agency->head_nip}
MD;

        file_put_contents($outputPath, $md);

        return $outputPath;
    }
}
