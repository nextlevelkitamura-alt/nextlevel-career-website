/**
 * Job Data Validator
 *
 * Validates extracted job data against business rules defined in ai-extraction spec.
 */

import type { ExtractedJobData } from '@/app/admin/actions';
import { detectEmploymentType } from './jobDataProcessor';

export type ValidationLevel = 'error' | 'warning';

export interface ValidationResult {
    field: string;
    level: ValidationLevel;
    message: string;
}

const VALID_TYPES = ['正社員', '派遣', '紹介予定派遣', '契約社員'];

/**
 * Validate extracted job data
 * Returns array of validation issues (empty = all valid)
 */
export function validateExtractedJobData(data: ExtractedJobData): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Required field checks
    if (!data.title?.trim()) {
        results.push({ field: 'title', level: 'error', message: 'タイトルは必須です' });
    }
    if (data.type && !VALID_TYPES.includes(data.type)) {
        results.push({ field: 'type', level: 'error', message: `雇用形態は ${VALID_TYPES.join('/')} のいずれかである必要があります` });
    }

    // Type checks - hourly_wage
    if (data.hourly_wage !== undefined && data.hourly_wage !== null) {
        if (data.hourly_wage < 800 || data.hourly_wage > 5000) {
            results.push({ field: 'hourly_wage', level: 'error', message: '時給は800〜5000の範囲である必要があります' });
        }
    }

    // Type checks - annual_salary_min
    if (data.annual_salary_min !== undefined && data.annual_salary_min !== null) {
        if (data.annual_salary_min < 200 || data.annual_salary_min > 2000) {
            results.push({ field: 'annual_salary_min', level: 'error', message: '年収下限は200〜2000万円の範囲である必要があります' });
        }
    }

    // Type checks - annual_salary_max
    if (data.annual_salary_max !== undefined && data.annual_salary_max !== null) {
        if (data.annual_salary_min !== undefined && data.annual_salary_min !== null) {
            if (data.annual_salary_max < data.annual_salary_min) {
                results.push({ field: 'annual_salary_max', level: 'error', message: '年収上限は年収下限以上である必要があります' });
            }
        } else {
            results.push({ field: 'annual_salary_min', level: 'error', message: '年収上限がある場合、年収下限も必要です' });
        }
    }

    // Type checks - annual_holidays (now string, validate numeric part if parseable)
    if (data.annual_holidays !== undefined && data.annual_holidays !== null && data.annual_holidays !== '') {
        const holidaysNum = parseInt(String(data.annual_holidays), 10);
        if (!isNaN(holidaysNum) && (holidaysNum < 0 || holidaysNum > 365)) {
            results.push({ field: 'annual_holidays', level: 'error', message: '年間休日は0〜365の範囲である必要があります' });
        }
    }

    // Cross-dependency checks
    const empType = detectEmploymentType(data);

    if (empType === 'dispatch' && (data.hourly_wage === undefined || data.hourly_wage === null)) {
        results.push({ field: 'hourly_wage', level: 'warning', message: '派遣求人には時給の入力を推奨します' });
    }

    if (empType === 'fulltime' && (data.annual_salary_min === undefined || data.annual_salary_min === null)) {
        results.push({ field: 'annual_salary_min', level: 'warning', message: '正社員求人には年収の入力を推奨します' });
    }

    return results;
}
