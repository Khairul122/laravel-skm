<?php

namespace App\Http\Controllers;

use App\Models\SurveyPeriod;
use App\Services\ReportService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function generate(SurveyPeriod $period, string $format): BinaryFileResponse
    {
        $result = $this->reportService->generate($period, $format, auth()->id());

        return response()->download($result['filePath'], $result['fileName']);
    }
}
