<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'unit_name' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'head_name' => ['nullable', 'string', 'max:120'],
            'head_nip' => ['nullable', 'string', 'max:30'],
            'head_position' => ['nullable', 'string', 'max:120'],
        ];
    }
}
