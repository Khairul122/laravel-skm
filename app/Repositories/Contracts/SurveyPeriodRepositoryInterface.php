<?php

namespace App\Repositories\Contracts;

use App\Models\SurveyPeriod;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface SurveyPeriodRepositoryInterface
{
    public function paginate(int $perPage = 10): LengthAwarePaginator;

    public function all(): Collection;

    public function findById(int $id): ?SurveyPeriod;

    public function findByAgency(int $agencyId): Collection;

    public function getRecent(int $limit = 5): Collection;

    public function create(array $data): SurveyPeriod;

    public function update(int $id, array $data): bool;

    public function delete(int $id): bool;

    public function count(): int;
}
