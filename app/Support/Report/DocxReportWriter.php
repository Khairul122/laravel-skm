<?php

namespace App\Support\Report;

use App\Models\Agency;
use App\Models\IkmResult;
use App\Models\SurveyPeriod;
use Illuminate\Support\Collection;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\JcTable;

class DocxReportWriter
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
        $phpWord = new PhpWord;
        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12);

        $section = $phpWord->addSection([
            'paperSize' => 'A4',
            'marginTop' => 1440, // 1 inch = 1440 twips
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        // Style Formats
        $titleStyle = ['bold' => true, 'size' => 14];
        $subtitleStyle = ['bold' => true, 'size' => 12];
        $h1Style = ['bold' => true, 'size' => 12, 'spaceBefore' => 200, 'spaceAfter' => 100];
        $boldStyle = ['bold' => true];
        $italicStyle = ['italic' => true];
        $pStyle = ['spaceAfter' => 120, 'alignment' => Jc::BOTH];
        $centerStyle = ['alignment' => Jc::CENTER];

        // JUDUL LAPORAN
        $section->addText('LAPORAN HASIL SURVEI KEPUASAN MASYARAKAT (SKM)', $titleStyle, $centerStyle);
        $section->addText(strtoupper($agency->unit_name ?: $agency->name), $subtitleStyle, $centerStyle);
        $section->addText(strtoupper($agency->name), $subtitleStyle, $centerStyle);
        $section->addText('PERIODE: '.strtoupper($period->label), ['bold' => true, 'size' => 11], $centerStyle);
        $section->addTextBreak(1);

        // BAB I: PENDAHULUAN
        $section->addText('BAB I: PENDAHULUAN', $h1Style);
        $section->addText('1.1 Latar Belakang', $boldStyle);
        $section->addText(
            "Penyelenggaraan pelayanan publik yang berkualitas, transparan, dan akuntabel merupakan kewajiban setiap instansi pemerintah sebagaimana diamanatkan dalam Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik dan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (Permenpan-RB) Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik. Pengukuran kepuasan masyarakat bertujuan untuk memperoleh gambaran objektif mengenai kualitas pelayanan pada {$agency->name}.",
            [],
            $pStyle
        );

        $section->addText('1.2 Maksud dan Tujuan', $boldStyle);
        $section->addText(
            'Survei Kepuasan Masyarakat ini dilaksanakan dengan maksud dan tujuan: (1) Mengetahui tingkat kepuasan masyarakat terhadap pelayanan publik yang diberikan, (2) Mengidentifikasi kelemahan atau kekurangan dari masing-masing unsur pelayanan, dan (3) Sebagai bahan penetapan kebijakan perbaikan mutu pelayanan publik.',
            [],
            $pStyle
        );

        $section->addText('1.3 Sembilan Unsur Pelayanan', $boldStyle);
        $section->addText(
            'Ruang lingkup survei mengacu pada 9 (sembilan) unsur pelayanan publik: (1) Persyaratan, (2) Sistem, Mekanisme, dan Prosedur, (3) Waktu Penyelesaian, (4) Biaya/Tarif, (5) Produk Spesifikasi Jenis Pelayanan, (6) Kompetensi Pelaksana, (7) Perilaku Pelaksana, (8) Penanganan Pengaduan, Saran dan Masukan, serta (9) Sarana dan Prasarana.',
            [],
            $pStyle
        );

        // BAB II: METODOLOGI
        $section->addText('BAB II: PELAKSANAAN SURVEI DAN METODOLOGI', $h1Style);
        $section->addText('2.1 Metode Pengumpulan Data', $boldStyle);
        $section->addText(
            'Pengumpulan data dilakukan menggunakan kuesioner terstruktur dengan skala Likert 1 sampai dengan 4: Nilai 1 (Tidak Baik / Tidak Mudah / Tidak Sesuai), Nilai 2 (Kurang Baik), Nilai 3 (Baik / Mudah / Sesuai), dan Nilai 4 (Sangat Baik / Sangat Mudah / Sangat Sesuai).',
            [],
            $pStyle
        );

        $section->addText('2.2 Jumlah Responden dan Kecukupan Sampel', $boldStyle);
        $populasiText = $period->population ? " dengan estimasi populasi sebanyak {$period->population} orang" : '';
        $section->addText(
            "Total data responden valid yang terkumpul dan dianalisis dalam periode survei ini berjumlah {$overall->respondent_count} orang responden{$populasiText}. Penentuan sampel mengacu pada tabel penentuan ukuran sampel Krejcie dan Morgan.",
            [],
            $pStyle
        );

        // BAB III: HASIL DAN ANALISIS
        $section->addText('BAB III: HASIL DAN ANALISIS INDEKS KEPUASAN MASYARAKAT', $h1Style);
        $section->addText('3.1 Nilai IKM Unit Pelayanan', $boldStyle);

        // Table Style
        $tableStyle = [
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 80,
            'alignment' => JcTable::CENTER,
        ];
        $headerCellStyle = ['bgColor' => 'F2F2F2'];

        $tableSummary = $section->addTable($tableStyle);
        $tableSummary->addRow();
        $tableSummary->addCell(2500, $headerCellStyle)->addText('Jumlah Responden', $boldStyle, $centerStyle);
        $tableSummary->addCell(2500, $headerCellStyle)->addText('Nilai IKM (Skala 100)', $boldStyle, $centerStyle);
        $tableSummary->addCell(2000, $headerCellStyle)->addText('Mutu Pelayanan', $boldStyle, $centerStyle);
        $tableSummary->addCell(2500, $headerCellStyle)->addText('Kinerja Unit', $boldStyle, $centerStyle);

        $tableSummary->addRow();
        $tableSummary->addCell(2500)->addText($overall->respondent_count.' Orang', [], $centerStyle);
        $tableSummary->addCell(2500)->addText(number_format($overall->ikm_score, 2), ['bold' => true, 'size' => 13], $centerStyle);
        $tableSummary->addCell(2000)->addText($overall->grade, ['bold' => true, 'size' => 13], $centerStyle);
        $tableSummary->addCell(2500)->addText(strtoupper($overall->performance), $boldStyle, $centerStyle);

        $section->addTextBreak(1);
        $section->addText(
            "Berdasarkan hasil pengolahan data, mutu pelayanan pada {$agency->name} berada pada kategori ".strtoupper($overall->performance)." (Mutu {$overall->grade}) dengan perolehan nilai IKM sebesar ".number_format($overall->ikm_score, 2).'.',
            [],
            $pStyle
        );

        // 3.2 Rincian 9 Unsur
        $section->addText('3.2 Rincian Nilai 9 Unsur Pelayanan', $boldStyle);
        $tableElements = $section->addTable($tableStyle);
        $tableElements->addRow();
        $tableElements->addCell(600, $headerCellStyle)->addText('No', $boldStyle, $centerStyle);
        $tableElements->addCell(4000, $headerCellStyle)->addText('Unsur Pelayanan', $boldStyle);
        $tableElements->addCell(1300, $headerCellStyle)->addText('NRR', $boldStyle, $centerStyle);
        $tableElements->addCell(1600, $headerCellStyle)->addText('NRR Tertimbang', $boldStyle, $centerStyle);
        $tableElements->addCell(1300, $headerCellStyle)->addText('Konversi', $boldStyle, $centerStyle);
        $tableElements->addCell(800, $headerCellStyle)->addText('Mutu', $boldStyle, $centerStyle);

        $elementScores = is_array($overall->element_scores) ? $overall->element_scores : [];
        $weakest = null;
        $strongest = null;

        foreach ($elementScores as $idx => $el) {
            $conv = (float) ($el['conversion'] ?? 0);
            $grade = $conv >= 88.31 ? 'A' : ($conv >= 76.61 ? 'B' : ($conv >= 65.00 ? 'C' : 'D'));

            if ($weakest === null || (float) $el['nrr'] < (float) $weakest['nrr']) {
                $weakest = $el;
            }
            if ($strongest === null || (float) $el['nrr'] > (float) $strongest['nrr']) {
                $strongest = $el;
            }

            $tableElements->addRow();
            $tableElements->addCell(600)->addText((string) ($idx + 1), [], $centerStyle);
            $tableElements->addCell(4000)->addText("{$el['name']} ({$el['code']})");
            $tableElements->addCell(1300)->addText(number_format((float) $el['nrr'], 2), [], $centerStyle);
            $tableElements->addCell(1600)->addText(number_format((float) $el['nrr_weighted'], 4), [], $centerStyle);
            $tableElements->addCell(1300)->addText(number_format($conv, 2), [], $centerStyle);
            $tableElements->addCell(800)->addText($grade, $boldStyle, $centerStyle);
        }

        $section->addTextBreak(1);

        // 3.3 Analisis Unsur Tertinggi dan Terendah
        $section->addText('3.3 Analisis Unsur Tertinggi dan Terendah', $boldStyle);
        if ($strongest) {
            $section->addText("• Unsur Tertinggi: {$strongest['name']} ({$strongest['code']}) dengan skor NRR ".number_format((float) $strongest['nrr'], 2)." (Konversi: ".number_format((float) $strongest['conversion'], 2).'). Aspek ini merupakan keunggulan pelayanan yang wajib dipertahankan.', [], $pStyle);
        }
        if ($weakest) {
            $section->addText("• Unsur Terendah (Prioritas Perbaikan): {$weakest['name']} ({$weakest['code']}) dengan skor NRR ".number_format((float) $weakest['nrr'], 2)." (Konversi: ".number_format((float) $weakest['conversion'], 2).'). Aspek ini menjadi fokus utama dalam perbaikan kualitas pelayanan.', [], $pStyle);
        }

        // 3.4 Rekapitulasi per Jenis Layanan
        $section->addText('3.4 Rekapitulasi Nilai per Jenis Layanan', $boldStyle);
        $tableServices = $section->addTable($tableStyle);
        $tableServices->addRow();
        $tableServices->addCell(600, $headerCellStyle)->addText('No', $boldStyle, $centerStyle);
        $tableServices->addCell(4500, $headerCellStyle)->addText('Jenis Layanan', $boldStyle);
        $tableServices->addCell(1500, $headerCellStyle)->addText('Responden', $boldStyle, $centerStyle);
        $tableServices->addCell(1500, $headerCellStyle)->addText('Nilai IKM', $boldStyle, $centerStyle);
        $tableServices->addCell(1500, $headerCellStyle)->addText('Mutu / Kinerja', $boldStyle, $centerStyle);

        foreach ($servicesResults as $idx => $svc) {
            $serviceName = $svc->serviceType?->name ?? 'Layanan Umum';
            $tableServices->addRow();
            $tableServices->addCell(600)->addText((string) ($idx + 1), [], $centerStyle);
            $tableServices->addCell(4500)->addText($serviceName);
            $tableServices->addCell(1500)->addText($svc->respondent_count.' Orang', [], $centerStyle);
            $tableServices->addCell(1500)->addText(number_format($svc->ikm_score, 2), $boldStyle, $centerStyle);
            $tableServices->addCell(1500)->addText("{$svc->grade} ({$svc->performance})", [], $centerStyle);
        }

        // BAB IV: KESIMPULAN
        $section->addText('BAB IV: KESIMPULAN DAN TINDAK LANJUT', $h1Style);
        $section->addText('4.1 Kesimpulan', $boldStyle);
        $section->addText(
            "1. Capaian Indeks Kepuasan Masyarakat (IKM) pada {$agency->name} periode {$period->label} adalah sebesar ".number_format($overall->ikm_score, 2)." dengan kategori mutu {$overall->grade} ({$overall->performance}).\n".
            '2. Unsur pelayanan dengan tingkat kepuasan tertinggi adalah '.($strongest['name'] ?? '-').".\n".
            '3. Unsur pelayanan dengan tingkat kepuasan terendah adalah '.($weakest['name'] ?? '-').'.',
            [],
            $pStyle
        );

        $section->addText('4.2 Rencana Aksi Tindak Lanjut', $boldStyle);
        $section->addText(
            "1. Melakukan evaluasi internal terarah terhadap unsur pelayanan yang memperoleh nilai terendah (".($weakest['name'] ?? '-').").\n".
            "2. Meningkatkan sarana pendukung dan pembinaan aparatur pelaksana pelayanan publik.\n".
            '3. Melakukan pemantauan berkala terhadap pelaksanaan standar pelayanan publik.',
            [],
            $pStyle
        );

        // LEMBAR PENGESAHAN
        $section->addTextBreak(1);
        $tableSign = $section->addTable(['borderSize' => 0, 'alignment' => JcTable::END]);
        $tableSign->addRow();
        $signCell = $tableSign->addCell(4000);
        $city = $agency->city ?: 'Kota Setempat';
        $date = now()->translatedFormat('d F Y');
        $signCell->addText("{$city}, {$date}", [], $centerStyle);
        $signCell->addText(strtoupper($agency->head_position ?: 'Kepala Instansi'), $boldStyle, $centerStyle);
        $signCell->addTextBreak(3);
        $signCell->addText($agency->head_name ?: '(Nama Kepala Instansi)', ['bold' => true, 'underline' => 'single'], $centerStyle);
        $signCell->addText('NIP. '.($agency->head_nip ?: '........................'), [], $centerStyle);

        // Save file
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($outputPath);

        return $outputPath;
    }
}
