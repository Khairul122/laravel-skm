<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuickCalculateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ratings' => ['required', 'array'],
            'ratings.U1' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U2' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U3' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U4' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U5' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U6' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U7' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U8' => ['required', 'numeric', 'min:1', 'max:4'],
            'ratings.U9' => ['required', 'numeric', 'min:1', 'max:4'],
        ];
    }
}
