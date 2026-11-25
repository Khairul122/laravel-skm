<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Respondent;
use App\Models\SurveyPeriod;
use App\Repositories\Contracts\IkmResultRepositoryInterface;
use App\Repositories\Contracts\SurveyPeriodRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected SurveyPeriodRepositoryInterface $periodRepo,
        protected IkmResultRepositoryInterface $ikmResultRepo
    ) {}

    public function index(Request $request): Response
    {
        $latestOverall = $this->ikmResultRepo->getLatestOverall();

        $stats = [
            'agencies' => Agency::count(),
            'periods' => $this->periodRepo->count(),
            'respondents' => Respondent::count(),
            'latestScore' => $latestOverall ? (float) $latestOverall->ikm_score : null,
        ];

        $recentPeriods = $this->periodRepo->getRecent(5);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'latestResult' => $latestOverall ? [
                'period_id' => $latestOverall->survey_period_id,
                'period_label' => $latestOverall->period?->label,
                'agency_name' => $latestOverall->period?->agency?->name,
                'respondent_count' => $latestOverall->respondent_count,
                'ikm_score' => (float) $latestOverall->ikm_score,
                'grade' => $latestOverall->grade,
                'performance' => $latestOverall->performance,
            ] : null,
            'recentPeriods' => $recentPeriods,
        ]);
    }
}
