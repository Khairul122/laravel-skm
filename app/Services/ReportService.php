<?php

namespace App\Services;

use App\Models\Report;
use App\Models\SurveyPeriod;
use App\Repositories\Contracts\IkmResultRepositoryInterface;
use App\Support\Report\DocxReportWriter;
use App\Support\Report\MarkdownReportWriter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ReportService
{
    public function __construct(
        protected IkmResultRepositoryInterface $ikmResultRepo,
        protected IkmCalculationService $calculationService,
        protected DocxReportWriter $docxWriter,
        protected MarkdownReportWriter $mdWriter
    ) {}

    /**
     * Membuat file laporan (docx atau md) dan mencatat riwayat ke database.
     *
     * @return array{filePath: string, fileName: string, mimeType: string}
     */
    public function generate(SurveyPeriod $period, string $format, ?int $userId = null): array
    {
        $format = strtolower($format);
        if (! in_array($format, ['docx', 'md'])) {
            throw new InvalidArgumentException("Format laporan tidak didukung: {$format}");
        }

        $agency = $period->agency;
        if (! $agency) {
            throw new InvalidArgumentException('Data instansi untuk periode ini tidak ditemukan.');
        }

        // Ambil hasil IKM (atau hitung jika belum ada)
        $overall = $this->ikmResultRepo->getOverallByPeriod($period->id);
        if (! $overall) {
            $this->calculationService->calculateAndSave($period->id);
            $overall = $this->ikmResultRepo->getOverallByPeriod($period->id);
        }

        if (! $overall) {
            throw new InvalidArgumentException('Belum ada data responden untuk menghasilkan laporan.');
        }

        $servicesResults = $this->ikmResultRepo->getServicesByPeriod($period->id);

        // Siapkan direktori reports di storage
        $reportsDir = storage_path('app/reports');
        if (! is_dir($reportsDir)) {
            mkdir($reportsDir, 0755, true);
        }

        // Format nama file: Laporan-SKM-[Instansi]-[Periode].docx
        $safeAgency = Str::slug($agency->name);
        $safePeriod = Str::slug($period->label);
        $fileName = "Laporan-SKM-{$safeAgency}-{$safePeriod}.{$format}";
        $outputPath = "{$reportsDir}/{$fileName}";

        if ($format === 'docx') {
            $this->docxWriter->generate($period, $agency, $overall, $servicesResults, $outputPath);
            $mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else {
            $this->mdWriter->generate($period, $agency, $overall, $servicesResults, $outputPath);
            $mimeType = 'text/markdown';
        }

        // Catat riwayat laporan
        Report::create([
            'survey_period_id' => $period->id,
            'user_id' => $userId,
            'format' => $format,
            'file_path' => "reports/{$fileName}",
        ]);

        return [
            'filePath' => $outputPath,
            'fileName' => $fileName,
            'mimeType' => $mimeType,
        ];
    }
}
