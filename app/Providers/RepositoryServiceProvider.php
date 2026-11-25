<?php

namespace App\Providers;

use App\Repositories\Contracts\AgencyRepositoryInterface;
use App\Repositories\Contracts\IkmResultRepositoryInterface;
use App\Repositories\Contracts\RespondentRepositoryInterface;
use App\Repositories\Contracts\SurveyPeriodRepositoryInterface;
use App\Repositories\Eloquent\EloquentAgencyRepository;
use App\Repositories\Eloquent\EloquentIkmResultRepository;
use App\Repositories\Eloquent\EloquentRespondentRepository;
use App\Repositories\Eloquent\EloquentSurveyPeriodRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AgencyRepositoryInterface::class, EloquentAgencyRepository::class);
        $this->app->bind(SurveyPeriodRepositoryInterface::class, EloquentSurveyPeriodRepository::class);
        $this->app->bind(RespondentRepositoryInterface::class, EloquentRespondentRepository::class);
        $this->app->bind(IkmResultRepositoryInterface::class, EloquentIkmResultRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
