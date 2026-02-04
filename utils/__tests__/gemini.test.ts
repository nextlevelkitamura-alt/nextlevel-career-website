import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mapTagsToHierarchy, extractHierarchicalTags, detectDuplicateJob } from '@/utils/gemini';
import { HierarchicalTags, HierarchicalExtractionResult, ExtractedJobData, Job } from '@/utils/types';
import { mockGenerateContent } from '../../jest.setup';

describe('extractHierarchicalTags', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    // Happy Path: Standard mode
    it('should extract hierarchical tags in standard mode', async () => {
        const jobText = '駅チカで残業少なめの求人です。';
        const mockResponse = {
            hierarchical_tags: {
                work_conditions: {
                    勤務地: ['駅チカ・駅ナカ'],
                    勤務時間: ['残業少なめ'],
                },
            },
            confidence: 85,
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockResponse),
            },
        });

        const result = await extractHierarchicalTags(jobText, 'standard');

        expect(result.hierarchical_tags).toEqual(mockResponse.hierarchical_tags);
        expect(result.confidence).toBe(85);
        expect(mockGenerateContent).toHaveBeenCalledWith(
            expect.stringContaining('企業名を具体的に出力してください')
        );
    });

    // Anonymous mode
    it('should extract hierarchical tags in anonymous mode', async () => {
        const jobText = '駅チカで残業少なめの求人です。';
        const mockResponse = {
            hierarchical_tags: {
                work_conditions: {
                    勤務地: ['駅チカ・駅ナカ'],
                },
            },
            confidence: 75,
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockResponse),
            },
        });

        const result = await extractHierarchicalTags(jobText, 'anonymous');

        expect(result.hierarchical_tags).toEqual(mockResponse.hierarchical_tags);
        expect(result.confidence).toBe(75);
        expect(mockGenerateContent).toHaveBeenCalledWith(
            expect.stringContaining('企業名を伏せて抽出してください')
        );
    });

    // Error handling
    it('should return empty result on error', async () => {
        const jobText = '駅チカで残業少なめの求人です。';

        mockGenerateContent.mockRejectedValue(new Error('AI API Error'));

        const result = await extractHierarchicalTags(jobText);

        expect(result.hierarchical_tags).toEqual({});
        expect(result.confidence).toBe(0);
    });

    // Missing confidence
    it('should default confidence to 0 when not provided', async () => {
        const jobText = '駅チカで残業少なめの求人です。';
        const mockResponse = {
            hierarchical_tags: {
                work_conditions: {
                    勤務地: ['駅チカ・駅ナカ'],
                },
            },
            // confidence missing
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockResponse),
            },
        });

        const result = await extractHierarchicalTags(jobText);

        expect(result.confidence).toBe(0);
    });

    // Empty hierarchical_tags
    it('should handle empty hierarchical_tags', async () => {
        const jobText = '駅チカで残業少なめの求人です。';
        const mockResponse = {
            hierarchical_tags: {},
            confidence: 0,
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockResponse),
            },
        });

        const result = await extractHierarchicalTags(jobText);

        expect(result.hierarchical_tags).toEqual({});
        expect(result.confidence).toBe(0);
    });
});

describe('mapTagsToHierarchy', () => {
    // Happy Path: Complete mapping
    it('should map flat tags to hierarchical structure', () => {
        const flatTags = ['駅チカ・駅ナカ', '残業少なめ', '土日祝休み', '未経験OK'];

        const result = mapTagsToHierarchy(flatTags);

        expect(result.work_conditions?.勤務地).toContain('駅チカ・駅ナカ');
        expect(result.work_conditions?.勤務時間).toContain('残業少なめ');
        expect(result.holidays?.週休制度).toContain('土日祝休み');
        expect(result.requirements?.経験).toContain('未経験OK');
    });

    // Edge Case: Empty array
    it('should return empty structure for empty input', () => {
        const result = mapTagsToHierarchy([]);

        expect(Object.keys(result).length).toBe(0);
    });

    // Edge Case: Unknown tag
    it('should ignore unknown tags', () => {
        const result = mapTagsToHierarchy(['不明なタグ']);

        expect(Object.keys(result).length).toBe(0);
        // work_conditions should be undefined since no tags matched
        expect(result.work_conditions?.勤務地).toBeUndefined();
    });

    // Multiple tags in same category
    it('should group multiple tags in same sub-category', () => {
        const flatTags = [
            '駅チカ・駅ナカ', '車通勤OK',  // both 勤務地
            '残業なし', '残業少なめ'  // both 勤務時間
        ];

        const result = mapTagsToHierarchy(flatTags);

        expect(result.work_conditions?.勤務地).toHaveLength(2);
        expect(result.work_conditions?.勤務時間).toHaveLength(2);
    });

    // All categories
    it('should map tags from all main categories', () => {
        const flatTags = [
            // work_conditions
            '駅チカ・駅ナカ',
            '残業なし',
            'リモートワーク可',
            // holidays
            '土日祝休み',
            '夏季休暇',
            // compensation
            '賞与あり',
            '交通費全額支給',
            // requirements
            '未経験OK',
            // recruitment_info
            '急募'
        ];

        const result = mapTagsToHierarchy(flatTags);

        // Verify all categories are populated
        expect(result.work_conditions?.勤務地).toContain('駅チカ・駅ナカ');
        expect(result.work_conditions?.働き方).toContain('リモートワーク可');
        expect(result.holidays?.週休制度).toContain('土日祝休み');
        expect(result.holidays?.長期休暇).toContain('夏季休暇');
        expect(result.compensation?.給与体系).toContain('賞与あり');
        expect(result.compensation?.手当).toContain('交通費全額支給');
        expect(result.requirements?.経験).toContain('未経験OK');
        expect(result.recruitment_info?.緊急度).toContain('急募');
    });

    // Japanese characters handling
    it('should handle Japanese characters correctly', () => {
        const flatTags = ['土日祝休み', '有給休暇', '産前産後休暇'];

        const result = mapTagsToHierarchy(flatTags);

        expect(result.holidays?.週休制度).toContain('土日祝休み');
        expect(result.holidays?.その他休暇).toContain('有給休暇');
        expect(result.holidays?.その他休暇).toContain('産前産後休暇');
    });

    // Duplicate tags
    it('should handle duplicate tags gracefully', () => {
        const flatTags = ['駅チカ・駅ナカ', '駅チカ・駅ナカ', '残業少なめ'];

        const result = mapTagsToHierarchy(flatTags);

        // Should deduplicate within the same sub-category
        expect(result.work_conditions?.勤務地).toHaveLength(1);
        expect(result.work_conditions?.勤務時間).toHaveLength(1);
    });
});

describe('detectDuplicateJob', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Happy Path: Duplicate found
    it('should detect duplicate when similar job exists', async () => {
        const newJobData: ExtractedJobData = {
            title: 'Webエンジニア募集',
            area: '東京都',
            salary: '月給25万円〜35万円',
            description: 'Webアプリケーション開発を行うエンジニアを募集しています。',
        };

        const existingJobs: Job[] = [
            {
                id: 'job1',
                title: 'Webエンジニア募集',
                area: '東京都',
                salary: '月給25万円〜35万円',
                description: 'Webアプリケーション開発を行うエンジニアを募集しています。',
            },
        ];

        const mockResponse = {
            is_duplicate: true,
            duplicate_ids: ['job1'],
            reason: 'タイトル、エリア、給与が一致しています。',
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockResponse),
            },
        });

        const result = await detectDuplicateJob(newJobData, existingJobs);

        expect(result.isDuplicate).toBe(true);
        expect(result.similarJobs).toHaveLength(1);
        expect(result.similarJobs?.[0].id).toBe('job1');
    });

    // No duplicate
    it('should return no duplicate when no similar job exists', async () => {
        const newJobData: ExtractedJobData = {
            title: 'データサイエンティスト募集',
            area: '大阪府',
            salary: '年収600万円〜800万円',
        };

        const existingJobs: Job[] = [
            {
                id: 'job1',
                title: 'Webエンジニア募集',
                area: '東京都',
                salary: '月給25万円〜35万円',
            },
        ];

        const mockResponse = {
            is_duplicate: false,
            duplicate_ids: [],
        };

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify(mockResponse),
            },
        });

        const result = await detectDuplicateJob(newJobData, existingJobs);

        expect(result.isDuplicate).toBe(false);
        expect(result.similarJobs).toBeUndefined();
    });

    // Empty existing jobs
    it('should return no duplicate when existing jobs is empty', async () => {
        const newJobData: ExtractedJobData = {
            title: 'Webエンジニア募集',
        };

        const existingJobs: Job[] = [];

        const result = await detectDuplicateJob(newJobData, existingJobs);

        expect(result.isDuplicate).toBe(false);
        expect(result.similarJobs).toEqual([]);
        expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    // Error handling
    it('should handle API errors gracefully', async () => {
        const newJobData: ExtractedJobData = {
            title: 'Webエンジニア募集',
        };

        const existingJobs: Job[] = [
            {
                id: 'job1',
                title: 'Webエンジニア募集',
                area: '東京都',
            },
        ];

        mockGenerateContent.mockRejectedValue(new Error('AI API Error'));

        const result = await detectDuplicateJob(newJobData, existingJobs);

        expect(result.isDuplicate).toBe(false);
        expect(result.similarJobs).toBeUndefined();
    });
});
