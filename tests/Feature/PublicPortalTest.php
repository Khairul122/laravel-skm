<?php

namespace Tests\Feature;

use App\Enums\PeriodStatus;
use App\Models\Agency;
use App\Models\IkmResult;
use App\Models\Respondent;
use App\Models\ServiceType;
use App\Models\SurveyPeriod;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_home_page_renders_government_portal_with_agency_and_periods(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('agency')
            ->has('activePeriods', 1)
            ->has('publications')
            ->has('elements', 9)
        );
    }

    public function test_public_questionnaire_page_renders_with_active_period_and_elements(): void
    {
        $response = $this->get('/kuesioner');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('questionnaire')
            ->has('periods', 1)
            ->has('elements', 9)
            ->where('selectedPeriodId', SurveyPeriod::first()->id)
        );
    }

    public function test_citizen_can_submit_anonymous_questionnaire_and_recalculate_ikm(): void
    {
        $period = SurveyPeriod::first();
        $serviceType = ServiceType::where('agency_id', $period->agency_id)->first();
        $beforeCount = Respondent::where('survey_period_id', $period->id)->count();

        $response = $this->post('/kuesioner', [
            'survey_period_id' => $period->id,
            'service_type_id' => $serviceType->id,
            'gender' => 'P',
            'age_range' => '20 - 30 Tahun',
            'education' => 'S1 / D4',
            'occupation' => 'Pegawai Swasta',
            'answers' => [
                'U1' => 4,
                'U2' => 4,
                'U3' => 3,
                'U4' => 4,
                'U5' => 4,
                'U6' => 4,
                'U7' => 4,
                'U8' => 3,
                'U9' => 4,
            ],
            'suggestion' => 'Pelayanan ramah dan cepat.',
        ]);

        $response->assertRedirect(route('questionnaire.show', ['periode' => $period->id]));
        $response->assertSessionHas('success');
        $response->assertSessionHas('submittedSummary');

        $this->assertSame($beforeCount + 1, Respondent::where('survey_period_id', $period->id)->count());

        $latestOverall = IkmResult::where('survey_period_id', $period->id)->whereNull('service_type_id')->first();
        $this->assertNotNull($latestOverall);
        $this->assertSame($beforeCount + 1, $latestOverall->respondent_count);
    }

    public function test_questionnaire_rejects_closed_period_and_mismatched_service_type(): void
    {
        $period = SurveyPeriod::first();
        $period->update(['status' => PeriodStatus::Closed]);

        $otherAgency = Agency::create(['name' => 'Instansi Lain']);
        $otherService = ServiceType::create(['agency_id' => $otherAgency->id, 'name' => 'Layanan Lain']);

        $response = $this->post('/kuesioner', [
            'survey_period_id' => $period->id,
            'service_type_id' => $otherService->id,
            'answers' => [
                'U1' => 4, 'U2' => 4, 'U3' => 4, 'U4' => 4, 'U5' => 4,
                'U6' => 4, 'U7' => 4, 'U8' => 4, 'U9' => 4,
            ],
        ]);

        $response->assertSessionHasErrors(['survey_period_id']);
    }
}