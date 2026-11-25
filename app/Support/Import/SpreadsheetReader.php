<?php

namespace App\Support\Import;

use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\IReader;

class SpreadsheetReader
{
    /**
     * Deteksi delimiter CSV (, ; atau tab).
     */
    public function detectDelimiter(string $filePath): string
    {
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            return ',';
        }

        $firstLine = fgets($handle);
        fclose($handle);

        if (! $firstLine) {
            return ',';
        }

        $semicolons = substr_count($firstLine, ';');
        $commas = substr_count($firstLine, ',');
        $tabs = substr_count($firstLine, "\t");

        if ($semicolons > $commas && $semicolons > $tabs) {
            return ';';
        }
        if ($tabs > $commas && $tabs > $semicolons) {
            return "\t";
        }

        return ',';
    }

    /**
     * Membaca header dan beberapa baris awal untuk pratinjau.
     *
     * @return array{headers: array<int, string>, previewRows: array<int, array<int, string>>, totalRowsEstimate: int}
     */
    public function preview(string $filePath, int $limit = 5): array
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if (in_array($extension, ['csv', 'txt'])) {
            return $this->previewCsv($filePath, $limit);
        }

        return $this->previewSpreadsheet($filePath, $limit);
    }

    /**
     * Membaca semua baris data sebagai array asosiatif (atau array numerik).
     *
     * @return array{headers: array<int, string>, rows: array<int, array<int, string>>}
     */
    public function readAll(string $filePath): array
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        if (in_array($extension, ['csv', 'txt'])) {
            return $this->readAllCsv($filePath);
        }

        return $this->readAllSpreadsheet($filePath);
    }

    private function previewCsv(string $filePath, int $limit): array
    {
        $delimiter = $this->detectDelimiter($filePath);
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            throw new InvalidArgumentException("Gagal membuka file: {$filePath}");
        }

        $headers = [];
        $first = fgetcsv($handle, 0, $delimiter);
        if ($first !== false) {
            $headers = array_map(fn ($h) => trim((string) $h), $first);
        }

        $previewRows = [];
        $count = 0;
        $totalEstimate = 0;

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $totalEstimate++;
            if ($count < $limit) {
                $previewRows[] = array_map(fn ($c) => trim((string) $c), $row);
                $count++;
            }
        }
        fclose($handle);

        return [
            'headers' => $headers,
            'previewRows' => $previewRows,
            'totalRowsEstimate' => $totalEstimate,
        ];
    }

    private function readAllCsv(string $filePath): array
    {
        $delimiter = $this->detectDelimiter($filePath);
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            throw new InvalidArgumentException("Gagal membuka file: {$filePath}");
        }

        $headers = [];
        $first = fgetcsv($handle, 0, $delimiter);
        if ($first !== false) {
            $headers = array_map(fn ($h) => trim((string) $h), $first);
        }

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (empty(array_filter($row, fn ($val) => trim((string) $val) !== ''))) {
                continue; // abaikan baris kosong
            }
            $rows[] = array_map(fn ($c) => trim((string) $c), $row);
        }
        fclose($handle);

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function previewSpreadsheet(string $filePath, int $limit): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $sheetData = $worksheet->toArray(null, true, true, false);

        if (empty($sheetData)) {
            return ['headers' => [], 'previewRows' => [], 'totalRowsEstimate' => 0];
        }

        $headers = array_map(fn ($h) => trim((string) $h), array_shift($sheetData));
        $previewRows = [];
        $totalEstimate = count($sheetData);

        for ($i = 0; $i < min($limit, $totalEstimate); $i++) {
            $previewRows[] = array_map(fn ($c) => trim((string) $c), $sheetData[$i]);
        }

        return [
            'headers' => $headers,
            'previewRows' => $previewRows,
            'totalRowsEstimate' => $totalEstimate,
        ];
    }

    private function readAllSpreadsheet(string $filePath): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $sheetData = $worksheet->toArray(null, true, true, false);

        if (empty($sheetData)) {
            return ['headers' => [], 'rows' => []];
        }

        $headers = array_map(fn ($h) => trim((string) $h), array_shift($sheetData));
        $rows = [];

        foreach ($sheetData as $row) {
            if (empty(array_filter($row, fn ($val) => trim((string) $val) !== ''))) {
                continue;
            }
            $rows[] = array_map(fn ($c) => trim((string) $c), $row);
        }

        return [
            'headers' => $headers,
            'rows' => $rows,
        ];
    }
}
