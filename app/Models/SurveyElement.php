<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurveyElement extends Model
{
    protected $fillable = ['code', 'name', 'question', 'aliases', 'sort_order'];

    protected function casts(): array
    {
        return ['aliases' => 'array'];
    }
}
