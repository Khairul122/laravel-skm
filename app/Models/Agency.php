<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agency extends Model
{
    protected $fillable = ['name', 'unit_name', 'address', 'city', 'head_name', 'head_nip', 'head_position', 'logo_path'];

    public function serviceTypes(): HasMany
    {
        return $this->hasMany(ServiceType::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(SurveyPeriod::class);
    }
}
