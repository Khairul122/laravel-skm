<?php

namespace App\Services;

use App\Models\Agency;
use App\Repositories\Contracts\AgencyRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class AgencyService
{
    public function __construct(
        protected AgencyRepositoryInterface $agencyRepo
    ) {}

    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return $this->agencyRepo->paginate($perPage);
    }

    public function all(): Collection
    {
        return $this->agencyRepo->all();
    }

    public function find(int $id): ?Agency
    {
        return $this->agencyRepo->findById($id);
    }

    public function create(array $data): Agency
    {
        return $this->agencyRepo->create($data);
    }

    public function update(int $id, array $data): bool
    {
        return $this->agencyRepo->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->agencyRepo->delete($id);
    }
}
