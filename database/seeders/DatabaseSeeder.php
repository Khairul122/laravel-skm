<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Respondent;
use App\Models\RespondentAnswer;
use App\Models\ServiceType;
use App\Models\SurveyElement;
use App\Models\SurveyPeriod;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedElements();

            $admin = User::updateOrCreate(
                ['email' => 'admin@skm.test'],
                ['name' => 'Administrator SKM', 'role' => 'admin', 'password' => Hash::make('password'), 'email_verified_at' => now()],
            );

            $agency = Agency::updateOrCreate(
                ['name' => 'Dinas Kependudukan dan Pencatatan Sipil'],
                [
                    'unit_name' => 'Unit Layanan Administrasi Kependudukan',
                    'address' => 'Jl. Contoh No. 1',
                    'city' => 'Kota Contoh',
                    'head_name' => 'Nama Kepala Dinas',
                    'head_nip' => '197001011995031001',
                    'head_position' => 'Kepala Dinas',
                ],
            );

            $period = SurveyPeriod::updateOrCreate(
                ['agency_id' => $agency->id, 'label' => 'Semester II Tahun 2026'],
                ['start_date' => '2026-07-01', 'end_date' => '2026-12-31', 'population' => 1200, 'status' => 'active', 'created_by' => $admin->id],
            );

            $this->seedDemoRespondents($agency, $period);
        });
    }

    private function seedElements(): void
    {
        $elements = [
            ['U1', 'Persyaratan', 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?', ['u1', 'unsur 1', 'persyaratan', 'syarat', 'p1']],
            ['U2', 'Sistem, Mekanisme, dan Prosedur', 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?', ['u2', 'unsur 2', 'prosedur', 'mekanisme', 'alur', 'p2']],
            ['U3', 'Waktu Penyelesaian', 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?', ['u3', 'unsur 3', 'waktu', 'kecepatan', 'durasi', 'p3']],
            ['U4', 'Biaya/Tarif', 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?', ['u4', 'unsur 4', 'biaya', 'tarif', 'biaya/tarif', 'ongkos', 'p4']],
            ['U5', 'Produk Spesifikasi Jenis Pelayanan', 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?', ['u5', 'unsur 5', 'produk', 'spesifikasi', 'hasil', 'p5']],
            ['U6', 'Kompetensi Pelaksana', 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?', ['u6', 'unsur 6', 'kompetensi', 'kemampuan', 'keahlian', 'petugas', 'p6']],
            ['U7', 'Perilaku Pelaksana', 'Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?', ['u7', 'unsur 7', 'perilaku', 'kesopanan', 'sikap', 'keramahan', 'p7']],
            ['U8', 'Penanganan Pengaduan, Saran dan Masukan', 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?', ['u8', 'unsur 8', 'pengaduan', 'keluhan', 'saran', 'masukan', 'p8']],
            ['U9', 'Sarana dan Prasarana', 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?', ['u9', 'unsur 9', 'sarana', 'prasarana', 'fasilitas', 'gedung', 'p9']],
        ];

        foreach ($elements as $i => [$code, $name, $question, $aliases]) {
            SurveyElement::updateOrCreate(
                ['code' => $code],
                ['name' => $name, 'question' => $question, 'aliases' => $aliases, 'sort_order' => $i + 1],
            );
        }
    }

    /** Data contoh 100 responden dari database/seeders/data/data-survei-100-demo.csv */
    private function seedDemoRespondents(Agency $agency, SurveyPeriod $period): void
    {
        if ($period->respondents()->exists()) {
            return;
        }

        $path = database_path('seeders/data/data-survei-100-demo.csv');
        if (! is_file($path)) {
            return;
        }

        $elementIds = SurveyElement::orderBy('sort_order')->pluck('id')->all();
        $handle = fopen($path, 'r');
        fgetcsv($handle); // header

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 12) {
                continue;
            }
            $service = ServiceType::firstOrCreate(['agency_id' => $agency->id, 'name' => trim($row[2])]);
            $respondent = Respondent::create([
                'survey_period_id' => $period->id,
                'service_type_id' => $service->id,
                'surveyed_at' => $period->start_date,
            ]);

            $answers = [];
            foreach ($elementIds as $idx => $elementId) {
                $answers[] = ['respondent_id' => $respondent->id, 'survey_element_id' => $elementId, 'score' => (int) $row[3 + $idx]];
            }
            RespondentAnswer::insert($answers);
        }
        fclose($handle);
    }
}
