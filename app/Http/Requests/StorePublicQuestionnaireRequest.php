<?php

namespace App\Http\Requests;

use App\Enums\PeriodStatus;
use App\Models\ServiceType;
use App\Models\SurveyPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePublicQuestionnaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'survey_period_id' => ['required', 'integer', 'exists:survey_periods,id'],
            'service_type_id' => ['required', 'integer', 'exists:service_types,id'],
            'gender' => ['nullable', 'in:L,P'],
            'age_range' => ['nullable', 'string', 'max:20'],
            'education' => ['nullable', 'string', 'max:50'],
            'occupation' => ['nullable', 'string', 'max:80'],
            'answers' => ['required', 'array'],
            'answers.U1' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U2' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U3' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U4' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U5' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U6' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U7' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U8' => ['required', 'integer', 'min:1', 'max:4'],
            'answers.U9' => ['required', 'integer', 'min:1', 'max:4'],
            'suggestion' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'survey_period_id.required' => 'Periode survei wajib dipilih.',
            'service_type_id.required' => 'Jenis layanan yang diterima wajib dipilih.',
            'answers.required' => 'Seluruh penilaian 9 unsur pelayanan wajib diisi.',
            'answers.*.required' => 'Pilihan penilaian untuk unsur ini wajib diisi.',
            'answers.*.integer' => 'Nilai penilaian harus berupa angka bulat 1 sampai 4.',
            'answers.*.min' => 'Nilai minimal adalah 1.',
            'answers.*.max' => 'Nilai maksimal adalah 4.',
            'suggestion.max' => 'Saran dan masukan maksimal 1.000 karakter.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $period = SurveyPeriod::find($this->integer('survey_period_id'));
            if (! $period || $period->status !== PeriodStatus::Active) {
                $validator->errors()->add('survey_period_id', 'Periode survei belum dibuka atau sudah ditutup.');

                return;
            }

            $serviceExists = ServiceType::where('id', $this->integer('service_type_id'))
                ->where('agency_id', $period->agency_id)
                ->where('is_active', true)
                ->exists();

            if (! $serviceExists) {
                $validator->errors()->add('service_type_id', 'Jenis layanan tidak tersedia pada instansi untuk periode ini.');
            }
        });
    }
}