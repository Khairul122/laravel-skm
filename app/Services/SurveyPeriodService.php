<?php

namespace App\Services;

use App\Models\SurveyPeriod;
use App\Repositories\Contracts\SurveyPeriodRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class SurveyPeriodService
{
    public function __construct(
        protected SurveyPeriodRepositoryInterface $periodRepo
    ) {}

    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return $this->periodRepo->paginate($perPage);
    }

    public function all(): Collection
    {
        return $this->periodRepo->all();
    }

    public function find(int $id): ?SurveyPeriod
    {
        return $this->periodRepo->findById($id);
    }

    public function findByAgency(int $agencyId): Collection
    {
        return $this->periodRepo->findByAgency($agencyId);
    }

    public function getRecent(int $limit = 5): Collection
    {
        return $this->periodRepo->getRecent($limit);
    }

    public function create(array $data): SurveyPeriod
    {
        return $this->periodRepo->create($data);
    }

    public function update(int $id, array $data): bool
    {
        return $this->periodRepo->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->periodRepo->delete($id);
    }

    public function count(): int
    {
        return $this->periodRepo->count();
    }
}
