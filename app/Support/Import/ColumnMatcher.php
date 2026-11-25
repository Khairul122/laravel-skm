<?php

namespace App\Support\Import;

use App\Models\SurveyElement;
use Illuminate\Support\Collection;

class ColumnMatcher
{
    public const SERVICE_TYPE_ALIASES = [
        'layanan',
        'jenis layanan',
        'jenis_layanan',
        'pelayanan',
        'keperluan',
        'service',
        'service_type',
    ];

    /**
     * @param  array<int, string>  $headers
     * @param  Collection<int, SurveyElement>|null  $elements
     * @return array{serviceType: ?string, U1: ?string, U2: ?string, U3: ?string, U4: ?string, U5: ?string, U6: ?string, U7: ?string, U8: ?string, U9: ?string}
     */
    public function match(array $headers, ?Collection $elements = null): array
    {
        if ($elements === null) {
            $elements = SurveyElement::orderBy('sort_order')->get();
        }

        $mapping = [
            'serviceType' => null,
            'U1' => null,
            'U2' => null,
            'U3' => null,
            'U4' => null,
            'U5' => null,
            'U6' => null,
            'U7' => null,
            'U8' => null,
            'U9' => null,
        ];

        $normalizedHeaders = [];
        foreach ($headers as $originalHeader) {
            $normalizedHeaders[$originalHeader] = strtolower(trim($originalHeader));
        }

        // 1. Cocokkan Service Type
        foreach ($normalizedHeaders as $orig => $norm) {
            foreach (self::SERVICE_TYPE_ALIASES as $alias) {
                if ($norm === $alias || str_contains($norm, $alias)) {
                    $mapping['serviceType'] = $orig;
                    break 2;
                }
            }
        }

        // 2. Cocokkan 9 Unsur (U1..U9)
        foreach ($elements as $element) {
            $code = $element->code;
            $codeLower = strtolower($code);
            $aliases = is_array($element->aliases) ? $element->aliases : [];

            // Urutkan prioritas: exact code, alias exact, lalu substring
            foreach ($normalizedHeaders as $orig => $norm) {
                // Exact code: e.g. "u1", "U1"
                if ($norm === $codeLower) {
                    $mapping[$code] = $orig;
                    continue 2;
                }
            }

            foreach ($normalizedHeaders as $orig => $norm) {
                // Cek aliases
                foreach ($aliases as $alias) {
                    $aliasLower = strtolower($alias);
                    if ($norm === $aliasLower || str_starts_with($norm, $aliasLower.'_') || str_starts_with($norm, $aliasLower.' ') || str_contains($norm, $aliasLower)) {
                        $mapping[$code] = $orig;
                        continue 3;
                    }
                }
            }
        }

        return $mapping;
    }
}
