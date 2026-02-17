// Types for Token Usage Tracking
export interface TokenUsage {
    promptTokens: number;
    candidateTokens: number;
    totalTokens: number;
}

// Types for Hierarchical Tagging

export type MainCategory = 'work_conditions' | 'holidays' | 'compensation' | 'requirements' | 'recruitment_info';

export interface HierarchicalTags {
    work_conditions?: {
        勤務地?: string[];
        勤務時間?: string[];
        働き方?: string[];
    };
    holidays?: {
        週休制度?: string[];
        年間休日?: string[];
        長期休暇?: string[];
        その他休暇?: string[];
    };
    compensation?: {
        給与体系?: string[];
        手当?: string[];
        福利厚生?: string[];
        キャリア?: string[];
    };
    requirements?: {
        経験?: string[];
        学歴?: string[];
        対象者?: string[];
        スキル?: string[];
    };
    recruitment_info?: {
        緊急度?: string[];
        企業タイプ?: string[];
        その他?: string[];
    };
}

export interface ExtractedJobData {
    title?: string;
    area?: string;
    type?: string;
    salary?: string;
    category?: string;
    tags?: string[];
    description?: string;
    requirements?: string[];
    working_hours?: string;
    holidays?: string[];
    benefits?: string[];
    selection_process?: string;
    nearest_station?: string;
    location_notes?: string;
    salary_type?: string;
    attire_type?: string;
    hair_style?: string;
    raise_info?: string;
    bonus_info?: string;
    commute_allowance?: string;
    job_category_detail?: string;
    // 派遣専用フィールド
    client_company_name?: string;
    training_period?: string;
    training_salary?: string;
    actual_work_hours?: string;
    work_days_per_week?: string;
    end_date?: string;
    nail_policy?: string;
    shift_notes?: string;
    general_notes?: string;
    // 正社員専用フィールド
    company_name?: string;
    industry?: string;
    company_overview?: string;
    company_size?: string;
    annual_salary_min?: number;
    annual_salary_max?: number;
    overtime_hours?: string;
    annual_holidays?: number;
    probation_period?: string;
    probation_details?: string;
    appeal_points?: string;
    welcome_requirements?: string;
    recruitment_background?: string;
    company_url?: string;
    business_overview?: string;
    company_address?: string;
    established_date?: string;
    smoking_policy?: string;
    department_details?: string;
}

export interface HierarchicalExtractionResult {
    hierarchical_tags?: HierarchicalTags;
    flattened_tags?: string[];
    tags?: string[];  // Legacy flat format
    confidence?: number;  // 0-100
}

export interface TagMappingResult {
    match: 'exact' | 'similar' | 'new';
    option?: { id: string; label: string; value: string };
    original: string;
    suggestion?: string;
    main_category?: MainCategory;
    sub_category?: string;
}

// Types for Duplicate Detection
export interface Job {
    id: string;
    title: string;
    area?: string;
    salary?: string;
    description?: string;
}

export interface DetectDuplicateResult {
    isDuplicate: boolean;
    similarJobs?: Job[];
    reason?: string;
}

// Types for Draft Jobs
export interface DraftJob {
    id: string;
    title: string;
    area: string | null;
    type: string | null;
    salary: string | null;
    category: string | null;
    tags: string[] | null;
    description: string | null;
    requirements: string | null;
    working_hours: string | null;
    holidays: string | null;
    benefits: string | null;
    selection_process: string | null;
    nearest_station: string | null;
    location_notes: string | null;
    salary_type: string | null;
    attire_type: string | null;
    hair_style: string | null;
    raise_info: string | null;
    bonus_info: string | null;
    commute_allowance: string | null;
    job_category_detail: string | null;
    hourly_wage: number | null;
    salary_description: string | null;
    period: string | null;
    start_date: string | null;
    workplace_name: string | null;
    workplace_address: string | null;
    workplace_access: string | null;
    attire: string | null;
    employment_type: 'dispatch' | 'fulltime' | null;
    extraction_status: 'success' | 'warning' | 'error';
    extraction_warnings: string[] | null;
    ai_confidence: number;
    created_at: string;
}

// Types for Job Details (Table Separation)

// 派遣求人の詳細情報
export interface DispatchJobDetails {
    id: string;
    client_company_name: string | null;
    is_client_company_public: boolean | null;
    training_salary: string | null;
    training_period: string | null;
    end_date: string | null;
    actual_work_hours: string | null;
    work_days_per_week: string | null;
    nail_policy: string | null;
    shift_notes: string | null;
    general_notes: string | null;
    created_at: string;
    updated_at: string;
}

// 正社員求人の詳細情報
export interface FulltimeJobDetails {
    id: string;
    company_name: string | null;
    is_company_name_public: boolean | null;
    company_address: string | null;
    industry: string | null;
    company_size: string | null;
    established_date: string | null;
    company_overview: string | null;
    business_overview: string | null;
    annual_salary_min: number | null;
    annual_salary_max: number | null;
    overtime_hours: string | null;
    annual_holidays: number | null;
    probation_period: string | null;
    probation_details: string | null;
    part_time_available: boolean | null;
    smoking_policy: string | null;
    appeal_points: string | null;
    welcome_requirements: string | null;
    department_details: string | null;
    recruitment_background: string | null;
    company_url: string | null;
    created_at: string;
    updated_at: string;
}

// 求人情報（詳細情報を含む）
export interface JobWithDetails extends Job {
    employment_type: 'dispatch' | 'fulltime';
    dispatch_details?: DispatchJobDetails;
    fulltime_details?: FulltimeJobDetails;
}
