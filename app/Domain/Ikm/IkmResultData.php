<?php

namespace App\Domain\Ikm;

use App\Enums\ServiceGrade;

final class IkmResultData
{
    /** @param ElementScoreData[] $elements */
    public function __construct(
        public readonly int $respondentCount,
        public readonly float $ikmWeighted,
        public readonly float $ikmScore,
        public readonly ServiceGrade $grade,
        public readonly array $elements,
    ) {}

    public function weakest(): ElementScoreData
    {
        return array_reduce($this->elements, fn ($c, $e) => $c === null || $e->nrr < $c->nrr ? $e : $c);
    }

    public function strongest(): ElementScoreData
    {
        return array_reduce($this->elements, fn ($c, $e) => $c === null || $e->nrr > $c->nrr ? $e : $c);
    }

    public function toArray(): array
    {
        return [
            'respondent_count' => $this->respondentCount,
            'ikm_weighted' => $this->ikmWeighted,
            'ikm_score' => $this->ikmScore,
            'grade' => $this->grade->value,
            'performance' => $this->grade->performance(),
            'elements' => array_map(fn (ElementScoreData $e) => $e->toArray(), $this->elements),
        ];
    }
}
