<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePublicQuestionnaireRequest;
use App\Services\PublicSurveyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPortalController extends Controller
{
    public function __construct(
        protected PublicSurveyService $publicSurveyService
    ) {}

    public function home(): Response
    {
        return Inertia::render('welcome', $this->publicSurveyService->getPortalData());
    }

    public function questionnaire(Request $request): Response
    {
        $periodId = $request->integer('periode') ?: null;
        $serviceTypeId = $request->integer('layanan') ?: null;

        return Inertia::render('questionnaire', array_merge(
            $this->publicSurveyService->getQuestionnaireData($periodId, $serviceTypeId),
            [
                'submittedSummary' => $request->session()->get('submittedSummary'),
            ]
        ));
    }

    public function storeQuestionnaire(StorePublicQuestionnaireRequest $request): RedirectResponse
    {
        $summary = $this->publicSurveyService->submitResponse($request->validated());

        return redirect()
            ->route('questionnaire.show', ['periode' => $summary['period_id']])
            ->with('success', 'Terima kasih, jawaban kuesioner kepuasan masyarakat Anda telah tercatat.')
            ->with('submittedSummary', $summary);
    }
}