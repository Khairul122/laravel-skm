<?php

namespace Tests\Unit;

use App\Models\SurveyElement;
use App\Support\Import\ColumnMatcher;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class ColumnMatcherTest extends TestCase
{
    public function test_matches_u1_to_u9_and_service_type_from_headers(): void
    {
        $headers = [
            'No',
            'Jenis Layanan',
            'Kesesuaian Persyaratan Pelayanan',
            'Kemudahan Prosedur',
            'Kecepatan Waktu Pelayanan',
            'Kewajaran Biaya / Tarif',
            'Kesesuaian Produk Spesifikasi',
            'Kompetensi Petugas',
            'Perilaku Petugas',
            'Penanganan Pengaduan',
            'Kualitas Sarana dan Prasarana',
        ];

        $elementsData = [
            ['code' => 'U1', 'aliases' => ['persyaratan', 'syarat']],
            ['code' => 'U2', 'aliases' => ['prosedur', 'mekanisme']],
            ['code' => 'U3', 'aliases' => ['waktu', 'kecepatan']],
            ['code' => 'U4', 'aliases' => ['biaya', 'tarif']],
            ['code' => 'U5', 'aliases' => ['produk', 'spesifikasi']],
            ['code' => 'U6', 'aliases' => ['kompetensi', 'petugas']],
            ['code' => 'U7', 'aliases' => ['perilaku', 'kesopanan']],
            ['code' => 'U8', 'aliases' => ['pengaduan', 'keluhan']],
            ['code' => 'U9', 'aliases' => ['sarana', 'prasarana']],
        ];

        $elements = new Collection(array_map(fn ($d) => new SurveyElement($d), $elementsData));

        $matcher = new ColumnMatcher();
        $matched = $matcher->match($headers, $elements);

        $this->assertEquals('Jenis Layanan', $matched['serviceType']);
        $this->assertEquals('Kesesuaian Persyaratan Pelayanan', $matched['U1']);
        $this->assertEquals('Kemudahan Prosedur', $matched['U2']);
        $this->assertEquals('Kecepatan Waktu Pelayanan', $matched['U3']);
        $this->assertEquals('Kewajaran Biaya / Tarif', $matched['U4']);
        $this->assertEquals('Kesesuaian Produk Spesifikasi', $matched['U5']);
        $this->assertEquals('Kompetensi Petugas', $matched['U6']);
        $this->assertEquals('Perilaku Petugas', $matched['U7']);
        $this->assertEquals('Penanganan Pengaduan', $matched['U8']);
        $this->assertEquals('Kualitas Sarana dan Prasarana', $matched['U9']);
    }
}
