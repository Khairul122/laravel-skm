<?php

namespace App\Http\Controllers;

use App\Models\SurveyPeriod;
use App\Services\IkmCalculationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IkmResultController extends Controller
{
    public function __construct(
        protected IkmCalculationService $ikmService
    ) {}

    public function show(SurveyPeriod $period): Response
    {
        $data = $this->ikmService->getResultsForPeriod($period);

        return Inertia::render('results/show', [
            'period' => $data['period'],
            'overall' => $data['overall'],
            'services' => $data['services'],
            'sample' => $data['sample'],
        ]);
    }

    public function recalculate(SurveyPeriod $period): RedirectResponse
    {
        $this->ikmService->calculateAndSave($period);

        return redirect()->back()->with('success', 'Perhitungan IKM berhasil diperbarui.');
    }
}
