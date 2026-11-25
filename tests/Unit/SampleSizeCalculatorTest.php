<?php

namespace Tests\Unit;

use App\Domain\Ikm\SampleSizeCalculator;
use PHPUnit\Framework\TestCase;

class SampleSizeCalculatorTest extends TestCase
{
    protected SampleSizeCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new SampleSizeCalculator();
    }

    public function test_krejcie_morgan_population_1200_returns_292(): void
    {
        $minimum = $this->calculator->minimum(1200);
        $this->assertEquals(292, $minimum);
    }

    public function test_sample_sufficiency_check(): void
    {
        $this->assertTrue($this->calculator->isSufficient(1200, 300));
        $this->assertFalse($this->calculator->isSufficient(1200, 50));
    }
}
