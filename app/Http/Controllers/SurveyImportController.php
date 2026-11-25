<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmImportMappingRequest;
use App\Http\Requests\UploadSurveyFileRequest;
use App\Models\SurveyImport;
use App\Models\SurveyPeriod;
use App\Services\SurveyImportService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SurveyImportController extends Controller
{
    public function __construct(
        protected SurveyImportService $importService
    ) {}

    public function create(SurveyPeriod $period): Response
    {
        return Inertia::render('imports/create', [
            'period' => $period->load('agency'),
        ]);
    }

    public function preview(UploadSurveyFileRequest $request, SurveyPeriod $period): Response
    {
        $file = $request->file('file');
        $previewData = $this->importService->preview($period, $file);

        return Inertia::render('imports/mapping', [
            'period' => $period->load('agency'),
            'importId' => $previewData['importId'],
            'headers' => $previewData['headers'],
            'previewRows' => $previewData['previewRows'],
            'suggestedMapping' => $previewData['suggestedMapping'],
            'elements' => $previewData['elements'],
        ]);
    }

    public function confirm(ConfirmImportMappingRequest $request, SurveyImport $import): RedirectResponse
    {
        $result = $this->importService->confirm($import, $request->validated()['mapping']);

        return redirect()->route('results.show', $import->survey_period_id)
            ->with('success', "Impor berhasil! {$result['valid_rows']} responden diproses. Nilai IKM telah dihitung otomatis.");
    }
}
