<?php

namespace App\Repositories\Contracts;

use App\Models\Respondent;
use Illuminate\Database\Eloquent\Collection;

interface RespondentRepositoryInterface
{
    public function countByPeriod(int $periodId): int;

    public function countTotal(): int;

    public function getByPeriod(int $periodId): Collection;

    /**
     * Mengambil matriks jawaban untuk kalkulasi IKM.
     * Mengembalikan array baris: [['U1' => 3, 'U2' => 4, ...], ...]
     *
     * @return array<int, array<string, int>>
     */
    public function getAnswersMatrixByPeriod(int $periodId, ?int $serviceTypeId = null): array;

    /**
     * Memasukkan responden dan jawabannya dalam batch.
     *
     * @param  array<int, array{data: array, answers: array<int, int>}>  $items
     */
    public function insertBatch(int $periodId, array $items): int;
}
