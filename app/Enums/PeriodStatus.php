<?php

namespace App\Enums;

enum PeriodStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Active => 'Berjalan',
            self::Closed => 'Ditutup',
        };
    }
}
