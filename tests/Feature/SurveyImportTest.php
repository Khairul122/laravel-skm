<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\SurveyImport;
use App\Models\SurveyPeriod;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SurveyImportTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Agency $agency;
    protected SurveyPeriod $period;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $this->user = User::first();
        $this->agency = Agency::first();
        $this->period = SurveyPeriod::first();
    }

    public function test_can_preview_survey_csv(): void
    {
        $csvContent = "Jenis Layanan,U1,U2,U3,U4,U5,U6,U7,U8,U9\n" .
                      "Layanan KTP,4,3,3,4,3,4,3,4,3\n" .
                      "Layanan KK,3,3,2,4,3,3,3,4,3\n";

        $file = UploadedFile::fake()->createWithContent('survey.csv', $csvContent);

        $response = $this->actingAs($this->user)
            ->withHeaders(['X-Inertia' => 'true'])
            ->post("/periode/{$this->period->id}/impor", [
                'file' => $file,
            ]);

        $response->assertOk();
    }

    public function test_can_confirm_survey_mapping_and_import(): void
    {
        $csvContent = "Jenis Layanan,U1,U2,U3,U4,U5,U6,U7,U8,U9\n" .
                      "Layanan KTP,4,3,3,4,3,4,3,4,3\n" .
                      "Layanan KK,3,3,2,4,3,3,3,4,3\n";

        $file = UploadedFile::fake()->createWithContent('survey.csv', $csvContent);

        // Preview creates survey_imports record
        $this->actingAs($this->user)
            ->withHeaders(['X-Inertia' => 'true'])
            ->post("/periode/{$this->period->id}/impor", [
                'file' => $file,
            ]);

        $import = SurveyImport::latest()->first();
        $this->assertNotNull($import);

        $mapping = [
            'serviceType' => 'Jenis Layanan',
            'U1' => 'U1',
            'U2' => 'U2',
            'U3' => 'U3',
            'U4' => 'U4',
            'U5' => 'U5',
            'U6' => 'U6',
            'U7' => 'U7',
            'U8' => 'U8',
            'U9' => 'U9',
        ];

        $response = $this->actingAs($this->user)
            ->post("/impor/{$import->id}/konfirmasi", [
                'mapping' => $mapping,
            ]);

        $response->assertRedirect(route('results.show', $this->period->id));
        $this->assertDatabaseHas('survey_imports', [
            'id' => $import->id,
            'valid_rows' => 2,
        ]);
    }
}
