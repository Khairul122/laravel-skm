<?php

namespace App\Repositories\Contracts;

use App\Domain\Ikm\IkmResultData;
use App\Models\IkmResult;
use Illuminate\Database\Eloquent\Collection;

interface IkmResultRepositoryInterface
{
    public function getByPeriod(int $periodId): Collection;

    public function getOverallByPeriod(int $periodId): ?IkmResult;

    public function getLatestOverall(): ?IkmResult;

    public function getServicesByPeriod(int $periodId): Collection;

    /**
     * Menyimpan hasil kalkulasi IKM untuk keseluruhan dan per jenis layanan.
     *
     * @param  array<int, array{service_type_id: int, result: IkmResultData}>  $servicesResults
     */
    public function saveResults(int $periodId, IkmResultData $overall, array $servicesResults): void;

    public function deleteByPeriod(int $periodId): void;
}
