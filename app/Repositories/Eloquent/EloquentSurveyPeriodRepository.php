<?php

namespace App\Repositories\Eloquent;

use App\Models\SurveyPeriod;
use App\Repositories\Contracts\SurveyPeriodRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentSurveyPeriodRepository implements SurveyPeriodRepositoryInterface
{
    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return SurveyPeriod::with('agency')
            ->withCount('respondents')
            ->latest('start_date')
            ->paginate($perPage);
    }

    public function all(): Collection
    {
        return SurveyPeriod::with('agency')->orderBy('start_date', 'desc')->get();
    }

    public function findById(int $id): ?SurveyPeriod
    {
        return SurveyPeriod::with(['agency', 'imports', 'results.serviceType'])->withCount('respondents')->find($id);
    }

    public function findByAgency(int $agencyId): Collection
    {
        return SurveyPeriod::where('agency_id', $agencyId)
            ->withCount('respondents')
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function getRecent(int $limit = 5): Collection
    {
        return SurveyPeriod::with('agency')
            ->withCount('respondents')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function create(array $data): SurveyPeriod
    {
        return SurveyPeriod::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $period = SurveyPeriod::find($id);
        if (! $period) {
            return false;
        }

        return $period->update($data);
    }

    public function delete(int $id): bool
    {
        $period = SurveyPeriod::find($id);
        if (! $period) {
            return false;
        }

        return (bool) $period->delete();
    }

    public function count(): int
    {
        return SurveyPeriod::count();
    }
}
