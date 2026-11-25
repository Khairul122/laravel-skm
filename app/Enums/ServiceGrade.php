<?php

namespace App\Enums;

/** Interval mutu pelayanan Permenpan-RB 14/2017 (nilai konversi 25-100). */
enum ServiceGrade: string
{
    case A = 'A';
    case B = 'B';
    case C = 'C';
    case D = 'D';

    public static function fromScore(float $score): self
    {
        $s = round($score, 2);

        return match (true) {
            $s >= 88.31 => self::A,
            $s >= 76.61 => self::B,
            $s >= 65.00 => self::C,
            default => self::D,
        };
    }

    public function performance(): string
    {
        return match ($this) {
            self::A => 'Sangat Baik',
            self::B => 'Baik',
            self::C => 'Kurang Baik',
            self::D => 'Tidak Baik',
        };
    }
}
