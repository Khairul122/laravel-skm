<?php

namespace App\Repositories\Eloquent;

use App\Models\Respondent;
use App\Models\RespondentAnswer;
use App\Models\SurveyElement;
use App\Repositories\Contracts\RespondentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentRespondentRepository implements RespondentRepositoryInterface
{
    public function countByPeriod(int $periodId): int
    {
        return Respondent::where('survey_period_id', $periodId)->count();
    }

    public function countTotal(): int
    {
        return Respondent::count();
    }

    public function getByPeriod(int $periodId): Collection
    {
        return Respondent::where('survey_period_id', $periodId)
            ->with(['serviceType', 'answers.element'])
            ->get();
    }

    public function getAnswersMatrixByPeriod(int $periodId, ?int $serviceTypeId = null): array
    {
        $elements = SurveyElement::orderBy('sort_order')->get(['id', 'code']);
        $elementCodeMap = $elements->pluck('code', 'id')->all();

        $query = DB::table('respondents')
            ->join('respondent_answers', 'respondents.id', '=', 'respondent_answers.respondent_id')
            ->where('respondents.survey_period_id', $periodId);

        if ($serviceTypeId !== null) {
            $query->where('respondents.service_type_id', $serviceTypeId);
        }

        $records = $query->select(
            'respondents.id as respondent_id',
            'respondent_answers.survey_element_id',
            'respondent_answers.score'
        )->get();

        $grouped = [];
        foreach ($records as $record) {
            $code = $elementCodeMap[$record->survey_element_id] ?? null;
            if ($code) {
                $grouped[$record->respondent_id][$code] = (int) $record->score;
            }
        }

        return array_values($grouped);
    }

    public function insertBatch(int $periodId, array $items): int
    {
        if (empty($items)) {
            return 0;
        }

        $insertedCount = 0;
        $now = now();

        // Bagi menjadi batch per 500
        $chunks = array_chunk($items, 500);

        foreach ($chunks as $chunk) {
            $respondentsData = [];
            $answersToInsert = [];

            foreach ($chunk as $item) {
                $respData = $item['data'];
                $respData['survey_period_id'] = $periodId;
                $respData['created_at'] = $now;
                $respData['updated_at'] = $now;

                $respId = DB::table('respondents')->insertGetId($respData);
                $insertedCount++;

                foreach ($item['answers'] as $elementId => $score) {
                    $answersToInsert[] = [
                        'respondent_id' => $respId,
                        'survey_element_id' => $elementId,
                        'score' => $score,
                    ];
                }
            }

            if (! empty($answersToInsert)) {
                // Batch insert answers
                foreach (array_chunk($answersToInsert, 1000) as $answerChunk) {
                    DB::table('respondent_answers')->insert($answerChunk);
                }
            }
        }

        return $insertedCount;
    }
}
