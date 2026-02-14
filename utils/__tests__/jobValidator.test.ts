import { describe, it, expect } from '@jest/globals';
import { validateExtractedJobData, ValidationResult } from '@/utils/jobValidator';

describe('validateExtractedJobData', () => {
    // === Required field checks ===

    it('should return error when title is missing', () => {
        const results = validateExtractedJobData({ area: '東京都', type: '派遣' });
        const titleError = results.find(r => r.field === 'title' && r.level === 'error');
        expect(titleError).toBeDefined();
    });

    it('should return error when title is empty string', () => {
        const results = validateExtractedJobData({ title: '', type: '派遣' });
        const titleError = results.find(r => r.field === 'title' && r.level === 'error');
        expect(titleError).toBeDefined();
    });

    it('should return error when type is invalid', () => {
        const results = validateExtractedJobData({ title: 'テスト', type: '不明' });
        const typeError = results.find(r => r.field === 'type' && r.level === 'error');
        expect(typeError).toBeDefined();
    });

    it('should accept valid type values', () => {
        for (const validType of ['正社員', '派遣', '紹介予定派遣', '契約社員']) {
            const results = validateExtractedJobData({ title: 'テスト', type: validType, area: '東京都' });
            const typeError = results.find(r => r.field === 'type' && r.level === 'error');
            expect(typeError).toBeUndefined();
        }
    });

    // === Type checks ===

    it('should return error when hourly_wage is out of range', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '派遣', hourly_wage: 100,
        });
        const error = results.find(r => r.field === 'hourly_wage' && r.level === 'error');
        expect(error).toBeDefined();
    });

    it('should accept valid hourly_wage', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '派遣', hourly_wage: 1400, area: '東京都',
        });
        const error = results.find(r => r.field === 'hourly_wage' && r.level === 'error');
        expect(error).toBeUndefined();
    });

    it('should return error when annual_salary_max < annual_salary_min', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '正社員',
            annual_salary_min: 600, annual_salary_max: 400,
        });
        const error = results.find(r => r.field === 'annual_salary_max' && r.level === 'error');
        expect(error).toBeDefined();
    });

    it('should return error when annual_salary_min is out of range', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '正社員', annual_salary_min: 50,
        });
        const error = results.find(r => r.field === 'annual_salary_min' && r.level === 'error');
        expect(error).toBeDefined();
    });

    it('should return error when annual_holidays is out of range', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '正社員', annual_holidays: 400,
        });
        const error = results.find(r => r.field === 'annual_holidays' && r.level === 'error');
        expect(error).toBeDefined();
    });

    // === Cross-dependency checks ===

    it('should warn when dispatch job has no hourly_wage', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '派遣', area: '東京都',
        });
        const warning = results.find(r => r.field === 'hourly_wage' && r.level === 'warning');
        expect(warning).toBeDefined();
    });

    it('should warn when fulltime job has no annual_salary_min', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '正社員', area: '東京都',
        });
        const warning = results.find(r => r.field === 'annual_salary_min' && r.level === 'warning');
        expect(warning).toBeDefined();
    });

    it('should return error when annual_salary_max exists without annual_salary_min', () => {
        const results = validateExtractedJobData({
            title: 'テスト', type: '正社員', annual_salary_max: 600,
        });
        const error = results.find(r => r.field === 'annual_salary_min' && r.level === 'error');
        expect(error).toBeDefined();
    });

    // === Happy path ===

    it('should return no errors for valid dispatch data', () => {
        const results = validateExtractedJobData({
            title: '【高時給】テスト求人',
            type: '派遣',
            area: '東京都 港区',
            hourly_wage: 1500,
            salary: '時給1,500円',
        });
        const errors = results.filter(r => r.level === 'error');
        expect(errors).toHaveLength(0);
    });

    it('should return no errors for valid fulltime data', () => {
        const results = validateExtractedJobData({
            title: 'エンジニア募集',
            type: '正社員',
            area: '東京都 渋谷区',
            annual_salary_min: 400,
            annual_salary_max: 600,
            annual_holidays: 125,
        });
        const errors = results.filter(r => r.level === 'error');
        expect(errors).toHaveLength(0);
    });
});
