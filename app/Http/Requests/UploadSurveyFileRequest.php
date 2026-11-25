<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadSurveyFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:csv,txt,xlsx,xls',
                'max:10240', // 10 MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Silakan pilih berkas survei yang akan diunggah.',
            'file.mimes' => 'Format berkas harus berupa .csv, .xlsx, atau .xls.',
            'file.max' => 'Ukuran berkas maksimal adalah 10 MB.',
        ];
    }
}
