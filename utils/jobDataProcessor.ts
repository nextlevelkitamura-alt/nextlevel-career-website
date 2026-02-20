/**
 * Job Data Processor
 *
 * Handles employment type detection and data separation
 * for dispatch/fulltime job details tables.
 */

import type { ExtractedJobData } from '@/app/admin/actions';

export type EmploymentType = 'dispatch' | 'fulltime';

const DISPATCH_TYPES = ['派遣', '紹介予定派遣', '派遣社員'];

/**
 * Detect employment type from extracted job data
 * Returns 'dispatch' for 派遣/紹介予定派遣, 'fulltime' for others
 */
export function detectEmploymentType(data: ExtractedJobData): EmploymentType {
    const type = data.type?.trim() ?? '';
    if (DISPATCH_TYPES.some(dt => type.includes(dt))) {
        return 'dispatch';
    }
    return 'fulltime';
}

export interface DispatchFields {
    client_company_name?: string;
    training_period?: string;
    training_salary?: string;
    actual_work_hours?: string;
    work_days_per_week?: string;
    end_date?: string;
    nail_policy?: string;
    general_notes?: string;
}

export interface FulltimeFields {
    company_name?: string;
    industry?: string;
    company_overview?: string;
    company_size?: string;
    annual_salary_min?: number;
    annual_salary_max?: number;
    overtime_hours?: string;
    annual_holidays?: string;
    probation_period?: string;
    probation_details?: string;
    appeal_points?: string;
    welcome_requirements?: string[];
}

/**
 * Extract dispatch-specific fields from extracted job data
 */
export function extractDispatchFields(data: ExtractedJobData): DispatchFields {
    return {
        client_company_name: data.client_company_name,
        training_period: data.training_period,
        training_salary: data.training_salary,
        actual_work_hours: data.actual_work_hours,
        work_days_per_week: data.work_days_per_week,
        end_date: data.end_date,
        nail_policy: data.nail_policy,
        general_notes: data.general_notes,
    };
}

/**
 * Extract fulltime-specific fields from extracted job data
 */
export function extractFulltimeFields(data: ExtractedJobData): FulltimeFields {
    return {
        company_name: data.company_name,
        industry: data.industry,
        company_overview: data.company_overview,
        company_size: data.company_size,
        annual_salary_min: data.annual_salary_min,
        annual_salary_max: data.annual_salary_max,
        overtime_hours: data.overtime_hours,
        annual_holidays: data.annual_holidays,
        probation_period: data.probation_period,
        probation_details: data.probation_details,
        appeal_points: data.appeal_points,
        welcome_requirements: data.welcome_requirements,
    };
}
