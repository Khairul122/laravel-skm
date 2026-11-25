<?php

namespace App\Models;

use App\Enums\PeriodStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveyPeriod extends Model
{
    protected $fillable = ['agency_id', 'label', 'start_date', 'end_date', 'population', 'status', 'created_by'];

    protected function casts(): array
    {
        return ['start_date' => 'date', 'end_date' => 'date', 'status' => PeriodStatus::class];
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function respondents(): HasMany
    {
        return $this->hasMany(Respondent::class);
    }

    public function imports(): HasMany
    {
        return $this->hasMany(SurveyImport::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(IkmResult::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
