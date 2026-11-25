<?php

namespace App\Domain\Ikm;

use App\Enums\ServiceGrade;
use InvalidArgumentException;

/**
 * Layer DOMAIN: logika murni Permenpan-RB 14/2017.
 * Tidak boleh bergantung pada Eloquent, HTTP, atau framework.
 *
 * NRR_j            = sum(skor_j) / N
 * NRR_tertimbang_j = NRR_j x 1/9
 * IKM              = sum(NRR_tertimbang_j)          (skala 1-4)
 * IKM_konversi     = IKM x 25                        (skala 25-100)
 */
final class IkmCalculator
{
    public const ELEMENT_CODES = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'];

    public const WEIGHT = 1 / 9;

    public const CONVERSION = 25;

    /**
     * @param  array<int, array<string,int>>  $rows  tiap baris: ['U1'=>1..4, ..., 'U9'=>1..4]
     * @param  array<string,string>  $elementNames  ['U1' => 'Persyaratan', ...]
     */
    public function calculate(array $rows, array $elementNames = []): IkmResultData
    {
        $n = count($rows);
        if ($n === 0) {
            throw new InvalidArgumentException('Tidak ada responden valid untuk dihitung.');
        }

        $totals = array_fill_keys(self::ELEMENT_CODES, 0);
        foreach ($rows as $i => $row) {
            foreach (self::ELEMENT_CODES as $code) {
                $score = $row[$code] ?? null;
                if (! is_int($score) || $score < 1 || $score > 4) {
                    throw new InvalidArgumentException("Skor {$code} baris ke-".($i + 1).' di luar rentang 1-4.');
                }
                $totals[$code] += $score;
            }
        }

        $elements = [];
        $weightedSum = 0.0;
        foreach (self::ELEMENT_CODES as $code) {
            $nrr = $totals[$code] / $n;
            $weighted = $nrr * self::WEIGHT;
            $weightedSum += $weighted;
            $elements[] = new ElementScoreData(
                code: $code,
                name: $elementNames[$code] ?? $code,
                total: $totals[$code],
                nrr: round($nrr, 4),
                nrrWeighted: round($weighted, 4),
                conversion: round($nrr * self::CONVERSION, 2),
            );
        }

        // Peringkat: konversi tertinggi = 1
        $sorted = $elements;
        usort($sorted, fn (ElementScoreData $a, ElementScoreData $b) => $b->nrr <=> $a->nrr);
        $ranks = [];
        foreach ($sorted as $idx => $el) {
            $ranks[$el->code] = $idx + 1;
        }
        $elements = array_map(fn (ElementScoreData $e) => $e->withRank($ranks[$e->code]), $elements);

        $score = round($weightedSum * self::CONVERSION, 2);
        $grade = ServiceGrade::fromScore($score);

        return new IkmResultData(
            respondentCount: $n,
            ikmWeighted: round($weightedSum, 4),
            ikmScore: $score,
            grade: $grade,
            elements: $elements,
        );
    }
}
