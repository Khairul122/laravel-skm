<?php

namespace App\Services;

use App\Domain\Ikm\IkmCalculator;
use App\Domain\Ikm\IkmResultData;
use App\Domain\Ikm\SampleSizeCalculator;
use App\Models\Respondent;
use App\Models\ServiceType;
use App\Models\SurveyElement;
use App\Models\SurveyPeriod;
use App\Repositories\Contracts\IkmResultRepositoryInterface;
use App\Repositories\Contracts\RespondentRepositoryInterface;
use InvalidArgumentException;

class IkmCalculationService
{
    public function __construct(
        protected RespondentRepositoryInterface $respondentRepo,
        protected IkmResultRepositoryInterface $ikmResultRepo,
        protected IkmCalculator $calculator,
        protected SampleSizeCalculator $sampleCalculator
    ) {}

    /**
     * Menghitung ulang IKM untuk periode tertentu dan menyimpannya ke database.
     *
     * @return array{
     *   period: SurveyPeriod,
     *   overall: array,
     *   services: array,
     *   sample: array{population: ?int, minimum: int, actual: int, sufficient: bool}
     * }
     */
    public function calculateAndSave(SurveyPeriod|int $period): array
    {
        $periodId = $period instanceof SurveyPeriod ? $period->id : $period;
        $period = $period instanceof SurveyPeriod ? $period : SurveyPeriod::with('agency')->findOrFail($periodId);
        $elements = SurveyElement::orderBy('sort_order')->get();
        $elementNames = $elements->pluck('name', 'code')->all();

        // 1. Ambil data baris keseluruhan
        $overallRows = $this->respondentRepo->getAnswersMatrixByPeriod($periodId);
        if (empty($overallRows)) {
            $this->ikmResultRepo->deleteByPeriod($periodId);

            return [
                'period' => $period,
                'overall' => null,
                'services' => [],
                'sample' => [
                    'population' => $period->population,
                    'minimum' => $this->sampleCalculator->minimum((int) $period->population),
                    'actual' => 0,
                    'sufficient' => false,
                ],
            ];
        }

        /** @var IkmResultData $overallResult */
        $overallResult = $this->calculator->calculate($overallRows, $elementNames);

        // 2. Ambil jenis layanan yang digunakan pada periode ini
        $serviceTypeIds = Respondent::where('survey_period_id', $periodId)
            ->distinct()
            ->pluck('service_type_id');

        $servicesResults = [];
        $servicesArray = [];

        foreach ($serviceTypeIds as $serviceId) {
            $serviceRows = $this->respondentRepo->getAnswersMatrixByPeriod($periodId, $serviceId);
            if (empty($serviceRows)) {
                continue;
            }

            $serviceType = ServiceType::find($serviceId);
            $serviceResult = $this->calculator->calculate($serviceRows, $elementNames);

            $servicesResults[] = [
                'service_type_id' => $serviceId,
                'result' => $serviceResult,
            ];

            $svcArr = $serviceResult->toArray();
            $svcArr['service_type_id'] = $serviceId;
            $svcArr['service_name'] = $serviceType?->name ?? 'Layanan Umum';
            $servicesArray[] = $svcArr;
        }

        // 3. Simpan ke database
        $this->ikmResultRepo->saveResults($periodId, $overallResult, $servicesResults);

        // 4. Analisis kecukupan sampel
        $pop = (int) ($period->population ?? 0);
        $minSample = $this->sampleCalculator->minimum($pop);
        $actual = count($overallRows);
        $sufficient = $pop > 0 ? $this->sampleCalculator->isSufficient($pop, $actual) : true;

        return [
            'period' => $period,
            'overall' => $overallResult->toArray(),
            'services' => $servicesArray,
            'sample' => [
                'population' => $period->population,
                'minimum' => $minSample,
                'actual' => $actual,
                'sufficient' => $sufficient,
            ],
        ];
    }

    /**
     * Mengambil hasil IKM yang tersimpan, atau hitung otomatis jika belum ada.
     */
    public function getResultsForPeriod(SurveyPeriod|int $period): array
    {
        $periodId = $period instanceof SurveyPeriod ? $period->id : $period;
        $period = $period instanceof SurveyPeriod ? $period : SurveyPeriod::with('agency')->findOrFail($periodId);
        $overallModel = $this->ikmResultRepo->getOverallByPeriod($periodId);

        if (! $overallModel) {
            return $this->calculateAndSave($periodId);
        }

        $servicesModels = $this->ikmResultRepo->getServicesByPeriod($periodId);

        $servicesArray = $servicesModels->map(function ($s) {
            return [
                'service_type_id' => $s->service_type_id,
                'service_name' => $s->serviceType?->name ?? 'Layanan Umum',
                'respondent_count' => $s->respondent_count,
                'ikm_weighted' => (float) $s->ikm_weighted,
                'ikm_score' => (float) $s->ikm_score,
                'grade' => $s->grade,
                'performance' => $s->performance,
                'elements' => $s->element_scores,
            ];
        })->all();

        $overallArray = [
            'respondent_count' => $overallModel->respondent_count,
            'ikm_weighted' => (float) $overallModel->ikm_weighted,
            'ikm_score' => (float) $overallModel->ikm_score,
            'grade' => $overallModel->grade,
            'performance' => $overallModel->performance,
            'elements' => $overallModel->element_scores,
        ];

        $pop = (int) ($period->population ?? 0);
        $minSample = $this->sampleCalculator->minimum($pop);
        $actual = $overallModel->respondent_count;
        $sufficient = $pop > 0 ? $this->sampleCalculator->isSufficient($pop, $actual) : true;

        return [
            'period' => $period,
            'overall' => $overallArray,
            'services' => $servicesArray,
            'sample' => [
                'population' => $period->population,
                'minimum' => $minSample,
                'actual' => $actual,
                'sufficient' => $sufficient,
            ],
        ];
    }
}
