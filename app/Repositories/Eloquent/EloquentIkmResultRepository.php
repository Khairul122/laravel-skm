<?php

namespace App\Repositories\Eloquent;

use App\Domain\Ikm\IkmResultData;
use App\Models\IkmResult;
use App\Repositories\Contracts\IkmResultRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentIkmResultRepository implements IkmResultRepositoryInterface
{
    public function getByPeriod(int $periodId): Collection
    {
        return IkmResult::where('survey_period_id', $periodId)
            ->with('serviceType')
            ->get();
    }

    public function getOverallByPeriod(int $periodId): ?IkmResult
    {
        return IkmResult::where('survey_period_id', $periodId)
            ->whereNull('service_type_id')
            ->first();
    }

    public function getLatestOverall(): ?IkmResult
    {
        return IkmResult::whereNull('service_type_id')
            ->with(['period.agency'])
            ->latest('calculated_at')
            ->first();
    }

    public function getServicesByPeriod(int $periodId): Collection
    {
        return IkmResult::where('survey_period_id', $periodId)
            ->whereNotNull('service_type_id')
            ->with('serviceType')
            ->get();
    }

    public function saveResults(int $periodId, IkmResultData $overall, array $servicesResults): void
    {
        DB::transaction(function () use ($periodId, $overall, $servicesResults) {
            $this->deleteByPeriod($periodId);

            $now = now();

            // Simpan keseluruhan
            IkmResult::create([
                'survey_period_id' => $periodId,
                'service_type_id' => null,
                'respondent_count' => $overall->respondentCount,
                'ikm_weighted' => $overall->ikmWeighted,
                'ikm_score' => $overall->ikmScore,
                'grade' => $overall->grade->value,
                'performance' => $overall->grade->performance(),
                'element_scores' => array_map(fn ($e) => $e->toArray(), $overall->elements),
                'calculated_at' => $now,
            ]);

            // Simpan per jenis layanan
            foreach ($servicesResults as $svc) {
                /** @var IkmResultData $res */
                $res = $svc['result'];
                IkmResult::create([
                    'survey_period_id' => $periodId,
                    'service_type_id' => $svc['service_type_id'],
                    'respondent_count' => $res->respondentCount,
                    'ikm_weighted' => $res->ikmWeighted,
                    'ikm_score' => $res->ikmScore,
                    'grade' => $res->grade->value,
                    'performance' => $res->grade->performance(),
                    'element_scores' => array_map(fn ($e) => $e->toArray(), $res->elements),
                    'calculated_at' => $now,
                ]);
            }
        });
    }

    public function deleteByPeriod(int $periodId): void
    {
        IkmResult::where('survey_period_id', $periodId)->delete();
    }
}
