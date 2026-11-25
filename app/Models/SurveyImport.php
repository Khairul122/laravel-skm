<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyImport extends Model
{
    protected $fillable = ['survey_period_id', 'user_id', 'original_filename', 'column_mapping', 'total_rows', 'valid_rows', 'invalid_rows', 'error_log', 'status'];

    protected function casts(): array
    {
        return ['column_mapping' => 'array', 'error_log' => 'array'];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(SurveyPeriod::class, 'survey_period_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
