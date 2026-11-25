<?php

namespace App\Services;

use App\Models\Respondent;
use App\Models\RespondentAnswer;
use App\Models\ServiceType;
use App\Models\SurveyElement;
use App\Models\SurveyImport;
use App\Models\SurveyPeriod;
use App\Repositories\Contracts\RespondentRepositoryInterface;
use App\Support\Import\ColumnMatcher;
use App\Support\Import\SpreadsheetReader;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class SurveyImportService
{
    public function __construct(
        protected SpreadsheetReader $reader,
        protected ColumnMatcher $columnMatcher,
        protected RespondentRepositoryInterface $respondentRepo,
        protected IkmCalculationService $ikmCalculationService
    ) {}

    /**
     * Membaca file survei, mencocokkan kolom secara prediktif, dan menyimpan ke file sementara.
     *
     * @return array{
     *   importId: int,
     *   headers: array<int, string>,
     *   previewRows: array<int, array<int, string>>,
     *   suggestedMapping: array<string, ?string>,
     *   elements: \Illuminate\Database\Eloquent\Collection
     * }
     */
    public function preview(SurveyPeriod $period, UploadedFile $file, ?int $userId = null): array
    {
        if ($period->status->value === 'closed') {
            throw new InvalidArgumentException('Periode survei sudah ditutup, tidak dapat menerima impor baru.');
        }

        // Simpan file sementara di storage/app/imports/
        $extension = $file->getClientOriginalExtension();
        $storedFilename = 'temp_'.uniqid().'.'.$extension;
        $tempPath = $file->storeAs('imports', $storedFilename);
        $fullPath = Storage::path($tempPath);

        // Baca preview
        $previewData = $this->reader->preview($fullPath, 5);
        $elements = SurveyElement::orderBy('sort_order')->get();
        $suggestedMapping = $this->columnMatcher->match($previewData['headers'], $elements);

        // Buat record SurveyImport berstatus pending
        $import = SurveyImport::create([
            'survey_period_id' => $period->id,
            'user_id' => $userId,
            'original_filename' => $file->getClientOriginalName(),
            'column_mapping' => $suggestedMapping,
            'total_rows' => $previewData['totalRowsEstimate'],
            'valid_rows' => 0,
            'invalid_rows' => 0,
            'error_log' => ['temp_file' => $tempPath],
            'status' => 'pending',
        ]);

        return [
            'importId' => $import->id,
            'headers' => $previewData['headers'],
            'previewRows' => $previewData['previewRows'],
            'suggestedMapping' => $suggestedMapping,
            'elements' => $elements,
        ];
    }

    /**
     * Mengonfirmasi pemetaan kolom, memvalidasi baris, menyimpan data responden, dan menghitung IKM.
     *
     * @param  array<string, string>  $mapping  ['serviceType' => 'Kolom_Layanan', 'U1' => 'Kolom_U1', ...]
     * @return array{total_rows: int, valid_rows: int, invalid_rows: int}
     */
    public function confirm(SurveyImport $import, array $mapping): array
    {
        $period = $import->period;
        if (! $period || $period->status->value === 'closed') {
            throw new InvalidArgumentException('Periode survei tidak ditemukan atau sudah ditutup.');
        }

        $errorLogData = $import->error_log ?? [];
        $tempFile = $errorLogData['temp_file'] ?? null;

        if (! $tempFile || ! Storage::exists($tempFile)) {
            throw new InvalidArgumentException('File survei sementara tidak ditemukan. Silakan unggah kembali.');
        }

        $fullPath = Storage::path($tempFile);
        $readResult = $this->reader->readAll($fullPath);
        $headers = $readResult['headers'];
        $rows = $readResult['rows'];

        // Buat peta nama kolom ke indeks array
        $headerIndexMap = [];
        foreach ($headers as $idx => $h) {
            $headerIndexMap[$h] = $idx;
        }

        $elements = SurveyElement::orderBy('sort_order')->get()->keyBy('code');

        $validItems = [];
        $errorLogs = [];
        $serviceTypesCache = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $rowIndex => $row) {
                $rowNumber = $rowIndex + 2; // +1 untuk 1-based, +1 karena ada header
                $isValid = true;
                $rowErrors = [];

                // 1. Ambil Jenis Layanan
                $serviceColName = $mapping['serviceType'] ?? null;
                $serviceName = 'Layanan Umum';
                if ($serviceColName && isset($headerIndexMap[$serviceColName])) {
                    $rawService = trim((string) ($row[$headerIndexMap[$serviceColName]] ?? ''));
                    if ($rawService !== '') {
                        $serviceName = $rawService;
                    }
                }

                if (! isset($serviceTypesCache[$serviceName])) {
                    $serviceTypesCache[$serviceName] = ServiceType::firstOrCreate([
                        'agency_id' => $period->agency_id,
                        'name' => $serviceName,
                    ])->id;
                }
                $serviceTypeId = $serviceTypesCache[$serviceName];

                // 2. Ambil Jawaban U1..U9
                $answers = [];
                foreach (['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'] as $code) {
                    $colName = $mapping[$code] ?? null;
                    if (! $colName || ! isset($headerIndexMap[$colName])) {
                        $isValid = false;
                        $rowErrors[] = "Kolom untuk {$code} tidak terpetakan.";
                        break;
                    }

                    $rawVal = $row[$headerIndexMap[$colName]] ?? null;
                    $score = filter_var($rawVal, FILTER_VALIDATE_INT);

                    if ($score === false || $score < 1 || $score > 4) {
                        $isValid = false;
                        $rowErrors[] = "Skor {$code} ('{$rawVal}') tidak valid (harus angka 1-4).";
                        break;
                    }

                    $elementId = $elements[$code]->id;
                    $answers[$elementId] = $score;
                }

                if ($isValid && count($answers) === 9) {
                    $validItems[] = [
                        'data' => [
                            'service_type_id' => $serviceTypeId,
                            'survey_import_id' => $import->id,
                            'surveyed_at' => $period->start_date,
                        ],
                        'answers' => $answers,
                    ];
                } else {
                    $errorLogs[] = [
                        'row' => $rowNumber,
                        'errors' => $rowErrors,
                    ];
                }
            }

            // Simpan batch ke database
            if (! empty($validItems)) {
                $this->respondentRepo->insertBatch($period->id, $validItems);
            }

            // Update status import
            $import->update([
                'column_mapping' => $mapping,
                'total_rows' => count($rows),
                'valid_rows' => count($validItems),
                'invalid_rows' => count($errorLogs),
                'error_log' => $errorLogs,
                'status' => 'completed',
            ]);

            // Hapus file sementara
            Storage::delete($tempFile);

            // Hitung ulang IKM periode
            $this->ikmCalculationService->calculateAndSave($period->id);

            DB::commit();

            return [
                'total_rows' => count($rows),
                'valid_rows' => count($validItems),
                'invalid_rows' => count($errorLogs),
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            $import->update(['status' => 'failed']);
            throw $e;
        }
    }
}
