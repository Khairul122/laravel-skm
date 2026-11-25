<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmImportMappingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mapping' => ['required', 'array'],
            'mapping.U1' => ['required', 'string'],
            'mapping.U2' => ['required', 'string'],
            'mapping.U3' => ['required', 'string'],
            'mapping.U4' => ['required', 'string'],
            'mapping.U5' => ['required', 'string'],
            'mapping.U6' => ['required', 'string'],
            'mapping.U7' => ['required', 'string'],
            'mapping.U8' => ['required', 'string'],
            'mapping.U9' => ['required', 'string'],
            'mapping.serviceType' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'mapping.required' => 'Pemetaan kolom wajib disediakan.',
            'mapping.U1.required' => 'Kolom untuk Unsur U1 (Persyaratan) wajib dipilih.',
            'mapping.U2.required' => 'Kolom untuk Unsur U2 (Prosedur) wajib dipilih.',
            'mapping.U3.required' => 'Kolom untuk Unsur U3 (Waktu) wajib dipilih.',
            'mapping.U4.required' => 'Kolom untuk Unsur U4 (Biaya/Tarif) wajib dipilih.',
            'mapping.U5.required' => 'Kolom untuk Unsur U5 (Produk) wajib dipilih.',
            'mapping.U6.required' => 'Kolom untuk Unsur U6 (Kompetensi) wajib dipilih.',
            'mapping.U7.required' => 'Kolom untuk Unsur U7 (Perilaku) wajib dipilih.',
            'mapping.U8.required' => 'Kolom untuk Unsur U8 (Pengaduan) wajib dipilih.',
            'mapping.U9.required' => 'Kolom untuk Unsur U9 (Sarana) wajib dipilih.',
        ];
    }
}
