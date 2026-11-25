<?php

namespace App\Http\Controllers;

use App\Domain\Ikm\IkmCalculator;
use App\Http\Requests\QuickCalculateRequest;
use App\Models\SurveyElement;
use Inertia\Inertia;
use Inertia\Response;

class QuickCalculatorController extends Controller
{
    public function __construct(
        protected IkmCalculator $calculator
    ) {}

    public function show(): Response
    {
        $elements = SurveyElement::orderBy('sort_order')->get();

        return Inertia::render('calculator', [
            'elements' => $elements,
            'result' => null,
        ]);
    }

    public function calculate(QuickCalculateRequest $request): Response
    {
        $elements = SurveyElement::orderBy('sort_order')->get();
        $answers = $request->validated()['answers'];

        // Map answers into single-respondent calculation
        $respondentsData = [$answers];
        $result = $this->calculator->calculate($respondentsData);

        return Inertia::render('calculator', [
            'elements' => $elements,
            'result' => $result->toArray(),
        ]);
    }

    public function guide(): Response
    {
        $elements = SurveyElement::orderBy('sort_order')->get();

        $gradeIntervals = [
            ['grade' => 'A', 'label' => 'Sangat Baik', 'range' => '88.31 - 100.00', 'color' => 'emerald'],
            ['grade' => 'B', 'label' => 'Baik', 'range' => '76.61 - 88.30', 'color' => 'blue'],
            ['grade' => 'C', 'label' => 'Kurang Baik', 'range' => '65.00 - 76.60', 'color' => 'amber'],
            ['grade' => 'D', 'label' => 'Tidak Baik', 'range' => '25.00 - 64.99', 'color' => 'red'],
        ];

        return Inertia::render('guide', [
            'elements' => $elements,
            'gradeIntervals' => $gradeIntervals,
        ]);
    }
}
