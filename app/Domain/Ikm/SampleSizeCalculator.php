<?php

namespace App\Domain\Ikm;

/**
 * Ukuran sampel minimum Krejcie & Morgan (1970), dipakai pedoman Permenpan-RB 14/2017.
 * s = X^2 N P(1-P) / (d^2 (N-1) + X^2 P(1-P)),  X^2 = 3.841, P = 0.5, d = 0.05
 */
final class SampleSizeCalculator
{
    public function minimum(int $population): int
    {
        if ($population <= 0) {
            return 0;
        }
        $x2 = 3.841;
        $p = 0.5;
        $d = 0.05;

        return (int) ceil(($x2 * $population * $p * (1 - $p)) / (($d ** 2) * ($population - 1) + $x2 * $p * (1 - $p)));
    }

    public function isSufficient(int $population, int $respondents): bool
    {
        return $respondents >= $this->minimum($population);
    }
}
