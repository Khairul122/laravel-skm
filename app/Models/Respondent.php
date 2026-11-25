<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Respondent extends Model
{
    protected $fillable = ['survey_period_id', 'service_type_id', 'survey_import_id', 'gender', 'age_range', 'education', 'occupation', 'surveyed_at', 'suggestion'];

    protected function casts(): array
    {
        return ['surveyed_at' => 'date'];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(SurveyPeriod::class, 'survey_period_id');
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(RespondentAnswer::class);
    }
}
