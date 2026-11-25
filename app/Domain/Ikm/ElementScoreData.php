<?php

namespace App\Domain\Ikm;

final class ElementScoreData
{
    public function __construct(
        public readonly string $code,
        public readonly string $name,
        public readonly int $total,
        public readonly float $nrr,
        public readonly float $nrrWeighted,
        public readonly float $conversion,
        public readonly int $rank = 0,
    ) {}

    public function withRank(int $rank): self
    {
        return new self($this->code, $this->name, $this->total, $this->nrr, $this->nrrWeighted, $this->conversion, $rank);
    }

    /** @return array{code:string,name:string,total:int,nrr:float,nrr_weighted:float,conversion:float,rank:int} */
    public function toArray(): array
    {
        return [
            'code' => $this->code,
            'name' => $this->name,
            'total' => $this->total,
            'nrr' => $this->nrr,
            'nrr_weighted' => $this->nrrWeighted,
            'conversion' => $this->conversion,
            'rank' => $this->rank,
        ];
    }
}
