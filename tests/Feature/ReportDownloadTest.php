<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\SurveyPeriod;
use App\Models\User;
use App\Services\IkmCalculationService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportDownloadTest extends TestCase
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

        // Calculate IKM snapshots on seeded respondents
        app(IkmCalculationService::class)->calculateAndSave($this->period);
    }

    public function test_can_generate_and_download_docx_report(): void
    {
        $response = $this->actingAs($this->user)
            ->post("/periode/{$this->period->id}/laporan/docx");

        $response->assertOk();
        $this->assertTrue(str_contains($response->headers->get('content-disposition') ?? '', '.docx'));
    }

    public function test_can_generate_and_download_markdown_report(): void
    {
        $response = $this->actingAs($this->user)
            ->post("/periode/{$this->period->id}/laporan/md");

        $response->assertOk();
        $this->assertTrue(str_contains($response->headers->get('content-disposition') ?? '', '.md'));
    }
}
