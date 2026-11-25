<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Models\Agency;
use App\Services\AgencyService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AgencyController extends Controller
{
    public function __construct(
        protected AgencyService $agencyService
    ) {}

    public function index(): Response
    {
        return Inertia::render('agencies/index', [
            'agencies' => $this->agencyService->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('agencies/form', [
            'agency' => null,
        ]);
    }

    public function store(StoreAgencyRequest $request): RedirectResponse
    {
        $this->agencyService->create($request->validated());

        return redirect()->route('agencies.index')->with('success', 'Instansi berhasil ditambahkan.');
    }

    public function edit(Agency $agency): Response
    {
        return Inertia::render('agencies/form', [
            'agency' => $agency,
        ]);
    }

    public function update(UpdateAgencyRequest $request, Agency $agency): RedirectResponse
    {
        $this->agencyService->update($agency->id, $request->validated());

        return redirect()->route('agencies.index')->with('success', 'Data instansi berhasil diperbarui.');
    }

    public function destroy(Agency $agency): RedirectResponse
    {
        $this->agencyService->delete($agency->id);

        return redirect()->route('agencies.index')->with('success', 'Instansi berhasil dihapus.');
    }
}
