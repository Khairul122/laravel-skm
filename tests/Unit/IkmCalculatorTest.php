<?php

namespace Tests\Unit;

use App\Domain\Ikm\IkmCalculator;
use App\Enums\ServiceGrade;
use PHPUnit\Framework\TestCase;

class IkmCalculatorTest extends TestCase
{
    protected IkmCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new IkmCalculator();
    }

    public function test_calculates_demo_respondent_scores_correctly(): void
    {
        $data = [
            ['U1' => 4, 'U2' => 3, 'U3' => 3, 'U4' => 4, 'U5' => 3, 'U6' => 4, 'U7' => 3, 'U8' => 4, 'U9' => 3],
            ['U1' => 3, 'U2' => 3, 'U3' => 2, 'U4' => 4, 'U5' => 3, 'U6' => 3, 'U7' => 3, 'U8' => 4, 'U9' => 3],
        ];

        $result = $this->calculator->calculate($data);

        $this->assertEquals(2, $result->respondentCount);
        $this->assertCount(9, $result->elements);
        $this->assertGreaterThan(0, $result->ikmScore);
        $this->assertContains($result->grade, [ServiceGrade::A, ServiceGrade::B, ServiceGrade::C, ServiceGrade::D]);
    }

    public function test_grade_intervals(): void
    {
        $this->assertEquals(ServiceGrade::A, ServiceGrade::fromScore(100.0));
        $this->assertEquals(ServiceGrade::A, ServiceGrade::fromScore(88.31));
        $this->assertEquals(ServiceGrade::B, ServiceGrade::fromScore(88.30));
        $this->assertEquals(ServiceGrade::B, ServiceGrade::fromScore(76.61));
        $this->assertEquals(ServiceGrade::C, ServiceGrade::fromScore(76.60));
        $this->assertEquals(ServiceGrade::C, ServiceGrade::fromScore(65.00));
        $this->assertEquals(ServiceGrade::D, ServiceGrade::fromScore(64.99));
        $this->assertEquals(ServiceGrade::D, ServiceGrade::fromScore(25.00));
    }

    public function test_identifies_lowest_and_highest_elements(): void
    {
        // U3 is clearly lowest (all 1), U1 is clearly highest (all 4)
        $data = [
            ['U1' => 4, 'U2' => 3, 'U3' => 1, 'U4' => 3, 'U5' => 3, 'U6' => 3, 'U7' => 3, 'U8' => 3, 'U9' => 3],
            ['U1' => 4, 'U2' => 3, 'U3' => 1, 'U4' => 3, 'U5' => 3, 'U6' => 3, 'U7' => 3, 'U8' => 3, 'U9' => 3],
        ];

        $result = $this->calculator->calculate($data);

        $this->assertEquals('U3', $result->weakest()->code);
        $this->assertEquals('U1', $result->strongest()->code);
    }
}
