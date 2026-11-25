export type Grade = 'A' | 'B' | 'C' | 'D';

export type PeriodStatus = 'draft' | 'active' | 'closed';

export interface Element {
    id: number;
    code: string;
    name: string;
    question: string;
    sort_order?: number;
}

export interface ElementScore {
    code: string;
    name: string;
    total: number;
    nrr: number;
    nrr_weighted: number;
    conversion: number;
    rank: number;
}

export interface IkmResult {
    respondent_count: number;
    ikm_weighted: number;
    ikm_score: number;
    grade: Grade;
    performance: string;
    elements: ElementScore[];
    calculated_at?: string;
}

export interface ServiceResult extends IkmResult {
    service_type_id: number;
    service_name: string;
}

export interface Agency {
    id: number;
    name: string;
    unit_name?: string | null;
    address?: string | null;
    city?: string | null;
    head_name?: string | null;
    head_nip?: string | null;
    head_position?: string | null;
    logo_path?: string | null;
    periods_count?: number;
    service_types_count?: number;
}

export interface SurveyImportRecord {
    id: number;
    survey_period_id: number;
    original_filename: string;
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    error_log?: Array<{ row?: number; reason?: string; message?: string }> | null;
    status: 'pending' | 'completed' | 'failed';
    created_at?: string;
    user?: { id: number; name: string } | null;
}

export interface PeriodResultRow {
    id: number;
    survey_period_id: number;
    service_type_id: number | null;
    service_type?: { id: number; name: string } | null;
    respondent_count: number;
    ikm_weighted: number;
    ikm_score: number;
    grade: Grade;
    performance: string;
    element_scores?: ElementScore[];
    calculated_at?: string;
}

export interface Period {
    id: number;
    agency_id: number;
    agency?: Agency;
    label: string;
    start_date: string;
    end_date: string;
    population?: number | null;
    status: PeriodStatus;
    respondents_count?: number;
    imports?: SurveyImportRecord[];
    results?: PeriodResultRow[];
}

export interface DashboardLatestResult {
    period_id?: number;
    period_label?: string | null;
    agency_name?: string | null;
    respondent_count: number;
    ikm_weighted?: number;
    ikm_score: number;
    grade: Grade;
    performance: string;
    elements?: ElementScore[];
}

export interface SampleSufficiency {
    population: number | null;
    minimum: number;
    actual: number;
    sufficient: boolean;
}

export interface GradeInterval {
    grade: Grade;
    min?: number;
    max?: number;
    range?: string;
    label?: string;
    color?: string;
    interval?: string;
    perception?: string;
    performance?: string;
    description?: string;
}

export interface SuggestedMapping {
    serviceType: string | null;
    U1: string | null;
    U2: string | null;
    U3: string | null;
    U4: string | null;
    U5: string | null;
    U6: string | null;
    U7: string | null;
    U8: string | null;
    U9: string | null;
    [key: string]: string | null | undefined;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    prev_page_url?: string | null;
    next_page_url?: string | null;
}

export interface DashboardStats {
    agencies: number;
    periods: number;
    respondents: number;
    latestScore: number | null;
}
