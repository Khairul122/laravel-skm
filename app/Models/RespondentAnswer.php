<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RespondentAnswer extends Model
{
    public $timestamps = false;

    protected $fillable = ['respondent_id', 'survey_element_id', 'score'];

    public function respondent(): BelongsTo
    {
        return $this->belongsTo(Respondent::class);
    }

    public function element(): BelongsTo
    {
        return $this->belongsTo(SurveyElement::class, 'survey_element_id');
    }
}
