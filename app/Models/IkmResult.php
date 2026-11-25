<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IkmResult extends Model
{
    protected $fillable = ['survey_period_id', 'service_type_id', 'respondent_count', 'ikm_weighted', 'ikm_score', 'grade', 'performance', 'element_scores', 'calculated_at'];

    protected function casts(): array
    {
        return [
            'element_scores' => 'array',
            'calculated_at' => 'datetime',
            'ikm_weighted' => 'float',
            'ikm_score' => 'float',
        ];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(SurveyPeriod::class, 'survey_period_id');
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }
}
