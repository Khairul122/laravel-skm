<?php

namespace App\Repositories\Eloquent;

use App\Models\Agency;
use App\Repositories\Contracts\AgencyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EloquentAgencyRepository implements AgencyRepositoryInterface
{
    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return Agency::withCount('periods')->latest()->paginate($perPage);
    }

    public function all(): Collection
    {
        return Agency::orderBy('name')->get();
    }

    public function findById(int $id): ?Agency
    {
        return Agency::with(['serviceTypes', 'periods'])->find($id);
    }

    public function create(array $data): Agency
    {
        return Agency::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $agency = Agency::find($id);
        if (! $agency) {
            return false;
        }

        return $agency->update($data);
    }

    public function delete(int $id): bool
    {
        $agency = Agency::find($id);
        if (! $agency) {
            return false;
        }

        return (bool) $agency->delete();
    }
}
