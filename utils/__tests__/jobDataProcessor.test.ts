import { describe, it, expect } from '@jest/globals';
import {
    detectEmploymentType,
    extractDispatchFields,
    extractFulltimeFields,
} from '@/utils/jobDataProcessor';

describe('detectEmploymentType', () => {
    it('should detect dispatch type for 派遣', () => {
        expect(detectEmploymentType({ type: '派遣' })).toBe('dispatch');
    });

    it('should detect dispatch type for 紹介予定派遣', () => {
        expect(detectEmploymentType({ type: '紹介予定派遣' })).toBe('dispatch');
    });

    it('should detect dispatch type for 派遣社員', () => {
        expect(detectEmploymentType({ type: '派遣社員' })).toBe('dispatch');
    });

    it('should detect fulltime type for 正社員', () => {
        expect(detectEmploymentType({ type: '正社員' })).toBe('fulltime');
    });

    it('should detect fulltime type for 契約社員', () => {
        expect(detectEmploymentType({ type: '契約社員' })).toBe('fulltime');
    });

    it('should default to fulltime when type is missing', () => {
        expect(detectEmploymentType({})).toBe('fulltime');
    });

    it('should default to fulltime for unknown types', () => {
        expect(detectEmploymentType({ type: 'パート' })).toBe('fulltime');
    });
});

describe('extractDispatchFields', () => {
    it('should extract dispatch-specific fields', () => {
        const data = {
            title: 'テスト求人',
            client_company_name: '株式会社テスト',
            training_period: '1ヶ月',
            training_salary: '時給1200円',
            actual_work_hours: '7.5時間',
            work_days_per_week: '週5日',
            end_date: '2026-06-30',
            nail_policy: 'ネイルOK',
            general_notes: '備考テスト',
        };

        const result = extractDispatchFields(data);

        expect(result.client_company_name).toBe('株式会社テスト');
        expect(result.training_period).toBe('1ヶ月');
        expect(result.training_salary).toBe('時給1200円');
        expect(result.actual_work_hours).toBe('7.5時間');
        expect(result.work_days_per_week).toBe('週5日');
        expect(result.end_date).toBe('2026-06-30');
        expect(result.nail_policy).toBe('ネイルOK');
        expect(result.general_notes).toBe('備考テスト');
    });

    it('should return empty object when no dispatch fields exist', () => {
        const data = { title: 'テスト求人', company_name: '会社名' };
        const result = extractDispatchFields(data);
        expect(Object.values(result).filter(v => v !== undefined).length).toBe(0);
    });
});

describe('extractFulltimeFields', () => {
    it('should extract fulltime-specific fields', () => {
        const data = {
            title: 'テスト求人',
            company_name: '株式会社テスト',
            industry: 'IT',
            company_overview: '会社概要テスト',
            company_size: '500名',
            annual_salary_min: 400,
            annual_salary_max: 600,
            overtime_hours: '月20時間',
            annual_holidays: '125',
            probation_period: '3ヶ月',
            probation_details: '給与同条件',
            appeal_points: 'やりがいあり',
            welcome_requirements: 'AWS経験歓迎',
        };

        const result = extractFulltimeFields(data);

        expect(result.company_name).toBe('株式会社テスト');
        expect(result.industry).toBe('IT');
        expect(result.company_overview).toBe('会社概要テスト');
        expect(result.company_size).toBe('500名');
        expect(result.annual_salary_min).toBe(400);
        expect(result.annual_salary_max).toBe(600);
        expect(result.overtime_hours).toBe('月20時間');
        expect(result.annual_holidays).toBe('125');
        expect(result.probation_period).toBe('3ヶ月');
        expect(result.probation_details).toBe('給与同条件');
        expect(result.appeal_points).toBe('やりがいあり');
        expect(result.welcome_requirements).toBe('AWS経験歓迎');
    });

    it('should return empty object when no fulltime fields exist', () => {
        const data = { title: 'テスト求人', client_company_name: '派遣先' };
        const result = extractFulltimeFields(data);
        expect(Object.values(result).filter(v => v !== undefined).length).toBe(0);
    });
});
