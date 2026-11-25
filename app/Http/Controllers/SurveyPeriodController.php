<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSurveyPeriodRequest;
use App\Http\Requests\UpdateSurveyPeriodRequest;
use App\Models\SurveyPeriod;
use App\Services\AgencyService;
use App\Services\SurveyPeriodService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SurveyPeriodController extends Controller
{
    public function __construct(
        protected SurveyPeriodService $periodService,
        protected AgencyService $agencyService
    ) {}

    public function index(): Response
    {
        return Inertia::render('periods/index', [
            'periods' => $this->periodService->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('periods/form', [
            'period' => null,
            'agencies' => $this->agencyService->all(),
        ]);
    }

    public function store(StoreSurveyPeriodRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()?->id;

        $this->periodService->create($data);

        return redirect()->route('periods.index')->with('success', 'Periode survei berhasil dibuat.');
    }

    public function show(SurveyPeriod $period): Response
    {
        $period->load(['agency', 'imports.user', 'results.serviceType'])->loadCount('respondents');

        return Inertia::render('periods/show', [
            'period' => $period,
            'agencies' => $this->agencyService->all(),
        ]);
    }

    public function edit(SurveyPeriod $period): Response
    {
        return Inertia::render('periods/form', [
            'period' => $period,
            'agencies' => $this->agencyService->all(),
        ]);
    }

    public function update(UpdateSurveyPeriodRequest $request, SurveyPeriod $period): RedirectResponse
    {
        $this->periodService->update($period->id, $request->validated());

        return redirect()->route('periods.index')->with('success', 'Periode survei berhasil diperbarui.');
    }

    public function destroy(SurveyPeriod $period): RedirectResponse
    {
        $this->periodService->delete($period->id);

        return redirect()->route('periods.index')->with('success', 'Periode survei berhasil dihapus.');
    }
}
