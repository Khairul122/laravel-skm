<?php

use App\Http\Controllers\AgencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IkmResultController;
use App\Http\Controllers\PublicPortalController;
use App\Http\Controllers\QuickCalculatorController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SurveyImportController;
use App\Http\Controllers\SurveyPeriodController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (SKM PermenPANRB 14/2017)
|--------------------------------------------------------------------------
|
| Pegangan bersama backend <-> UI (ARCHITECTURE.md bagian 5)
|
*/

// Public routes
Route::get('/', [PublicPortalController::class, 'home'])->name('home');
Route::get('/kuesioner', [PublicPortalController::class, 'questionnaire'])->name('questionnaire.show');
Route::post('/kuesioner', [PublicPortalController::class, 'storeQuestionnaire'])->name('questionnaire.store');
Route::get('/kalkulator', [QuickCalculatorController::class, 'show'])->name('calculator');
Route::post('/kalkulator', [QuickCalculatorController::class, 'calculate'])->name('calculator.calculate');
Route::get('/panduan', [QuickCalculatorController::class, 'guide'])->name('guide');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('instansi', AgencyController::class)
        ->names('agencies');

    Route::resource('periode', SurveyPeriodController::class)
        ->names('periods');

    Route::get('/periode/{period}/impor', [SurveyImportController::class, 'create'])->name('imports.create');
    Route::post('/periode/{period}/impor', [SurveyImportController::class, 'preview'])->name('imports.preview');
    Route::post('/impor/{import}/konfirmasi', [SurveyImportController::class, 'confirm'])->name('imports.confirm');

    Route::get('/periode/{period}/hasil', [IkmResultController::class, 'show'])->name('results.show');
    Route::post('/periode/{period}/hitung-ulang', [IkmResultController::class, 'recalculate'])->name('results.recalculate');

    Route::post('/periode/{period}/laporan/{format}', [ReportController::class, 'generate'])->name('reports.generate');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';