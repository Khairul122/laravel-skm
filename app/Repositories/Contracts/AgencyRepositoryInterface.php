<?php

namespace App\Repositories\Contracts;

use App\Models\Agency;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AgencyRepositoryInterface
{
    public function paginate(int $perPage = 10): LengthAwarePaginator;

    public function all(): Collection;

    public function findById(int $id): ?Agency;

    public function create(array $data): Agency;

    public function update(int $id, array $data): bool;

    public function delete(int $id): bool;
}
