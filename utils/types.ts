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
    raise_info?: string;
    bonus_info?: string;
    commute_allowance?: string;
    job_category_detail?: string;
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
    raise_info: string | null;
    bonus_info: string | null;
    commute_allowance: string | null;
    job_category_detail: string | null;
    extraction_status: 'success' | 'warning' | 'error';
    extraction_warnings: string[] | null;
    ai_confidence: number;
    created_at: string;
}
