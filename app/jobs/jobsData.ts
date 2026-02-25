import { DispatchJobDetails, FulltimeJobDetails } from "@/utils/types";

export type Job = {
    id: string;
    title: string;
    area: string;
    search_areas?: string[] | null;
    type: string;
    salary: string;
    category: string;
    tags: string[];
    job_code?: string;
    job_attachments?: {
        id: string;
        file_name: string;
        file_url: string;
        file_size: number;
    }[];
    description?: string;
    requirements?: string;
    working_hours?: string;
    holidays?: string;
    benefits?: string;
    selection_process?: string;
    workplace_address?: string | null;
    nearest_station?: string;
    nearest_station_is_estimated?: boolean;
    location_notes?: string;
    salary_type?: string;
    attire_type?: string;
    hair_style?: string;
    raise_info?: string;
    bonus_info?: string;
    commute_allowance?: string;
    job_category_detail?: string;
    hourly_wage?: number;
    salary_description?: string;
    period?: string;
    start_date?: string;
    attire?: string;
    employment_type?: 'dispatch' | 'fulltime';
    dispatch_job_details?: DispatchJobDetails | null;
    fulltime_job_details?: FulltimeJobDetails | null;
    ai_analysis?: {
        generated_tags: string[];
        suitability_scores: {
            A_stability: number;
            B_private_life: number;
            C_income_growth: number;
            D_speed_immediate: number;
        };
        employment_type_normalized?: string;
        salary_analysis?: {
            min: number;
            max: number;
            is_annual: boolean;
        };
        summary?: string;
    };
};

export const jobsData: Job[] = [
    {
        id: '1',
        title: '【未経験OK】大手IT企業での一般事務サポート',
        area: '東京',
        type: '派遣',
        salary: '時給 1,600円〜',
        category: '事務',
        tags: ['駅チカ', '未経験OK', '残業少なめ'],
    },
    {
        id: '2',
        title: '急募！コールセンター受信業務（インバウンド）',
        area: '大阪',
        type: '派遣',
        salary: '時給 1,400円〜',
        category: 'コールセンター',
        tags: ['シフト制', '週3日〜OK', '服装自由'],
    },
    {
        id: '3',
        title: '法人営業職（ルートセールス中心）',
        area: '東京',
        type: '正社員',
        salary: '月給 28万円〜',
        category: '営業',
        tags: ['土日祝休み', '賞与あり', '交通費全額支給'],
    },
    {
        id: '4',
        title: '【リモート可】Webデザイナー・コーダー',
        area: 'リモート',
        type: '紹介予定派遣',
        salary: '時給 1,800円〜',
        category: 'クリエイティブ',
        tags: ['在宅', '経験者優遇', 'フレックス'],
    },
    {
        id: '5',
        title: '経理事務スタッフ（簿記2級必須）',
        area: '東京',
        type: '正社員',
        salary: '月給 25万円〜',
        category: '事務',
        tags: ['駅チカ', '資格手当あり', '年間休日120日'],
    },
    {
        id: '6',
        title: 'カスタマーサポート（チャット対応メイン）',
        area: 'リモート',
        type: '派遣',
        salary: '時給 1,500円〜',
        category: 'コールセンター',
        tags: ['在宅', '研修あり', 'PC貸与'],
    },
    {
        id: '7',
        title: '人材コーディネーター',
        area: '大阪',
        type: '正社員',
        salary: '月給 30万円〜',
        category: '営業',
        tags: ['インセンティブあり', '駅チカ', '若手活躍中'],
    },
    {
        id: '8',
        title: 'データ入力・集計業務',
        area: '東京',
        type: '派遣',
        salary: '時給 1,550円〜',
        category: '事務',
        tags: ['短期', '週4日OK', 'コツコツ作業'],
    },
    {
        id: '9',
        title: 'ITヘルプデスク（社内SE補助）',
        area: '東京',
        type: '紹介予定派遣',
        salary: '時給 1,900円〜',
        category: 'IT・エンジニア',
        tags: ['高時給', 'スキルアップ', '社員登用あり'],
    },
];
