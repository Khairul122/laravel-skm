<?php

namespace App\Services;

use App\Enums\PeriodStatus;
use App\Models\Agency;
use App\Models\IkmResult;
use App\Models\Respondent;
use App\Models\RespondentAnswer;
use App\Models\ServiceType;
use App\Models\SurveyElement;
use App\Models\SurveyPeriod;
use App\Repositories\Contracts\IkmResultRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublicSurveyService
{
    public function __construct(
        protected IkmResultRepositoryInterface $ikmResultRepo,
        protected IkmCalculationService $ikmCalculationService
    ) {}

    /**
     * Data portal publik untuk halaman beranda pemerintah.
     */
    public function getPortalData(): array
    {
        $elements = SurveyElement::orderBy('sort_order')
            ->get(['id', 'code', 'name', 'question', 'sort_order']);

        $activePeriods = SurveyPeriod::query()
            ->where('status', PeriodStatus::Active->value)
            ->with([
                'agency.serviceTypes' => fn ($q) => $q->where('is_active', true)->orderBy('name'),
            ])
            ->withCount('respondents')
            ->orderByDesc('start_date')
            ->get();

        $latestOverall = $this->ikmResultRepo->getLatestOverall();

        $primaryAgency = $activePeriods->first()?->agency
            ?? $latestOverall?->period?->agency
            ?? Agency::with(['serviceTypes' => fn ($q) => $q->where('is_active', true)->orderBy('name')])->first();

        if ($primaryAgency && ! $primaryAgency->relationLoaded('serviceTypes')) {
            $primaryAgency->load(['serviceTypes' => fn ($q) => $q->where('is_active', true)->orderBy('name')]);
        }

        $serviceTypes = $primaryAgency?->serviceTypes ?? collect();

        return [
            'agency' => $primaryAgency ? [
                'id' => $primaryAgency->id,
                'name' => $primaryAgency->name,
                'unit_name' => $primaryAgency->unit_name,
                'address' => $primaryAgency->address,
                'city' => $primaryAgency->city,
                'head_name' => $primaryAgency->head_name,
                'head_position' => $primaryAgency->head_position,
            ] : null,
            'serviceTypes' => $serviceTypes->map(fn (ServiceType $svc) => [
                'id' => $svc->id,
                'agency_id' => $svc->agency_id,
                'name' => $svc->name,
                'is_active' => (bool) $svc->is_active,
            ])->values()->all(),
            'activePeriods' => $activePeriods->map(fn (SurveyPeriod $period) => [
                'id' => $period->id,
                'agency_id' => $period->agency_id,
                'label' => $period->label,
                'start_date' => $period->start_date?->toDateString(),
                'end_date' => $period->end_date?->toDateString(),
                'population' => $period->population,
                'status' => $period->status?->value ?? 'active',
                'respondents_count' => (int) ($period->respondents_count ?? 0),
                'agency' => $period->agency ? [
                    'id' => $period->agency->id,
                    'name' => $period->agency->name,
                    'unit_name' => $period->agency->unit_name,
                    'city' => $period->agency->city,
                ] : null,
            ])->values()->all(),
            'latestResult' => $latestOverall ? [
                'period_id' => $latestOverall->survey_period_id,
                'period_label' => $latestOverall->period?->label,
                'agency_name' => $latestOverall->period?->agency?->name,
                'respondent_count' => (int) $latestOverall->respondent_count,
                'ikm_weighted' => (float) $latestOverall->ikm_weighted,
                'ikm_score' => (float) $latestOverall->ikm_score,
                'grade' => $latestOverall->grade,
                'performance' => $latestOverall->performance,
                'elements' => $latestOverall->element_scores ?? [],
                'calculated_at' => $latestOverall->calculated_at?->toIso8601String(),
            ] : null,
            'elements' => $elements->toArray(),
            'publications' => $this->getPublications(),
            'totalAgencies' => Agency::count(),
            'totalRespondents' => Respondent::count(),
        ];
    }

    /**
     * Publikasi IKM keseluruhan unit, satu hasil terbaru per periode (maks. 6).
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getPublications(): array
    {
        return IkmResult::query()
            ->whereNull('service_type_id')
            ->with(['period.agency'])
            ->latest('calculated_at')
            ->get()
            ->unique('survey_period_id')
            ->take(6)
            ->map(fn (IkmResult $result) => [
                'period_id' => $result->survey_period_id,
                'period_label' => $result->period?->label,
                'start_date' => $result->period?->start_date?->toDateString(),
                'end_date' => $result->period?->end_date?->toDateString(),
                'agency_name' => $result->period?->agency?->name,
                'respondent_count' => (int) $result->respondent_count,
                'ikm_score' => (float) $result->ikm_score,
                'grade' => $result->grade,
                'performance' => $result->performance,
                'elements' => $result->element_scores ?? [],
                'calculated_at' => $result->calculated_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    /**
     * Data untuk halaman pengisian kuesioner publik.
     */
    public function getQuestionnaireData(?int $requestedPeriodId = null, ?int $requestedServiceTypeId = null): array
    {
        $elements = SurveyElement::orderBy('sort_order')
            ->get(['id', 'code', 'name', 'question', 'sort_order']);

        $activePeriods = SurveyPeriod::query()
            ->where('status', PeriodStatus::Active->value)
            ->with([
                'agency.serviceTypes' => fn ($q) => $q->where('is_active', true)->orderBy('name'),
            ])
            ->withCount('respondents')
            ->orderByDesc('start_date')
            ->get();

        $formattedPeriods = $activePeriods->map(fn (SurveyPeriod $period) => [
            'id' => $period->id,
            'agency_id' => $period->agency_id,
            'label' => $period->label,
            'start_date' => $period->start_date?->toDateString(),
            'end_date' => $period->end_date?->toDateString(),
            'population' => $period->population,
            'status' => $period->status?->value ?? 'active',
            'respondents_count' => (int) ($period->respondents_count ?? 0),
            'agency' => $period->agency ? [
                'id' => $period->agency->id,
                'name' => $period->agency->name,
                'unit_name' => $period->agency->unit_name,
                'address' => $period->agency->address,
                'city' => $period->agency->city,
                'head_name' => $period->agency->head_name,
                'head_position' => $period->agency->head_position,
            ] : null,
            'service_types' => $period->agency
                ? $period->agency->serviceTypes->map(fn (ServiceType $svc) => [
                    'id' => $svc->id,
                    'agency_id' => $svc->agency_id,
                    'name' => $svc->name,
                    'is_active' => (bool) $svc->is_active,
                ])->values()->all()
                : [],
        ])->values()->all();

        $selectedPeriod = collect($formattedPeriods)->firstWhere('id', $requestedPeriodId)
            ?? ($formattedPeriods[0] ?? null);

        $selectedServiceTypeId = null;
        if ($selectedPeriod && $requestedServiceTypeId) {
            $match = collect($selectedPeriod['service_types'])->firstWhere('id', $requestedServiceTypeId);
            if ($match) {
                $selectedServiceTypeId = (int) $match['id'];
            }
        }

        return [
            'periods' => $formattedPeriods,
            'elements' => $elements->toArray(),
            'selectedPeriodId' => $selectedPeriod['id'] ?? null,
            'selectedServiceTypeId' => $selectedServiceTypeId,
        ];
    }

    /**
     * Simpan satu responden anonim beserta 9 jawaban unsur dan perbarui snapshot IKM.
     *
     * @return array{
     *   period_id: int,
     *   period_label: string,
     *   agency_name: string,
     *   unit_name: ?string,
     *   service_name: string,
     *   respondent_count: int,
     *   submitted_at: string
     * }
     */
    public function submitResponse(array $validated): array
    {
        return DB::transaction(function () use ($validated) {
            $period = SurveyPeriod::with('agency')->lockForUpdate()->findOrFail($validated['survey_period_id']);

            if ($period->status !== PeriodStatus::Active) {
                throw ValidationException::withMessages([
                    'survey_period_id' => 'Periode survei ini sudah tidak aktif menerima pengisian kuesioner.',
                ]);
            }

            $serviceType = ServiceType::where('id', $validated['service_type_id'])
                ->where('agency_id', $period->agency_id)
                ->where('is_active', true)
                ->first();

            if (! $serviceType) {
                throw ValidationException::withMessages([
                    'service_type_id' => 'Jenis layanan tidak valid atau sudah tidak aktif pada instansi periode ini.',
                ]);
            }

            $elements = SurveyElement::orderBy('sort_order')->get(['id', 'code']);
            if ($elements->count() < 9) {
                throw ValidationException::withMessages([
                    'answers' => 'Master 9 unsur pelayanan belum lengkap di sistem.',
                ]);
            }

            $respondent = Respondent::create([
                'survey_period_id' => $period->id,
                'service_type_id' => $serviceType->id,
                'survey_import_id' => null,
                'gender' => $validated['gender'] ?? null,
                'age_range' => $validated['age_range'] ?? null,
                'education' => $validated['education'] ?? null,
                'occupation' => $validated['occupation'] ?? null,
                'surveyed_at' => now()->toDateString(),
                'suggestion' => isset($validated['suggestion']) && trim((string) $validated['suggestion']) !== ''
                    ? trim((string) $validated['suggestion'])
                    : null,
            ]);

            $answerRows = [];
            foreach ($elements as $element) {
                $score = (int) ($validated['answers'][$element->code] ?? 0);
                if ($score < 1 || $score > 4) {
                    throw ValidationException::withMessages([
                        "answers.{$element->code}" => "Penilaian untuk {$element->code} wajib dipilih (skala 1 sampai 4).",
                    ]);
                }
                $answerRows[] = [
                    'respondent_id' => $respondent->id,
                    'survey_element_id' => $element->id,
                    'score' => $score,
                ];
            }

            RespondentAnswer::insert($answerRows);

            $calculated = $this->ikmCalculationService->calculateAndSave($period);
            $totalCount = (int) ($calculated['sample']['actual'] ?? $period->respondents()->count());

            return [
                'period_id' => $period->id,
                'period_label' => $period->label,
                'agency_name' => $period->agency?->name ?? 'Instansi Pelayanan Publik',
                'unit_name' => $period->agency?->unit_name,
                'service_name' => $serviceType->name,
                'respondent_count' => $totalCount,
                'submitted_at' => now()->toIso8601String(),
            ];
        });
    }
}