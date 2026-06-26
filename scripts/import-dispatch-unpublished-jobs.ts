/**
 * 未掲載派遣求人PDF 2026-06-26 -> Supabase import
 *
 * Usage:
 *   node tmp/run-scripts/scripts/import-dispatch-unpublished-jobs.js
 *   node tmp/run-scripts/scripts/import-dispatch-unpublished-jobs.js --execute
 *
 * Build:
 *   npx tsc scripts/import-dispatch-unpublished-jobs.ts --module commonjs --target es2020 --moduleResolution node --esModuleInterop --skipLibCheck --outDir tmp/run-scripts
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SOURCE_NAME = "dispatch_pdf_20260626";
const DOCUMENT_BUCKET = "job-documents";
const PDF_SOURCE_DIR = "/Users/kitamuranaohiro/Desktop/未掲載候補_派遣求人票_20260626";
const CONSULTATION_START_DATE = "2026-06-26";
const CONSULTATION_END_DATE = "2026-07-31";
const execute = process.argv.includes("--execute");
const attachPdfs = process.argv.includes("--attach-pdfs");
const linkConsultation = process.argv.includes("--link-consultation");
const refreshTitles = process.argv.includes("--refresh-titles");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type JobPayload = {
    title: string;
    job_code: string;
    area: string;
    search_areas: string[];
    type: "派遣";
    salary: string;
    category: string[];
    tags: string[];
    client_id: null;
    description: string | null;
    requirements: string | null;
    working_hours: string | null;
    holidays: string | null;
    benefits: string | null;
    selection_process: string | null;
    hourly_wage: number | null;
    salary_description: string | null;
    period: string | null;
    start_date: string | null;
    workplace_name: string | null;
    workplace_address: string | null;
    workplace_access: string | null;
    attire: string | null;
    attire_type: string | null;
    hair_style: string | null;
    nearest_station: string | null;
    location_notes: string | null;
    salary_type: "時給制";
    raise_info: null;
    bonus_info: null;
    commute_allowance: string | null;
    job_category_detail: string | null;
    published_at: string;
    expires_at: string | null;
};

type DispatchPayload = {
    client_company_name: string | null;
    is_client_company_public: false;
    training_salary: string | null;
    training_period: string | null;
    end_date: string | null;
    actual_work_hours: string | null;
    work_days_per_week: string | null;
    nail_policy: string | null;
    shift_notes: string | null;
    general_notes: string | null;
};

type ImportJob = {
    no: string;
    sourceFile: string;
    job: Omit<JobPayload, "published_at">;
    dispatch: DispatchPayload;
};

function job(
    no: string,
    sourceFile: string,
    payload: Omit<JobPayload, "job_code" | "type" | "client_id" | "salary_type" | "published_at" | "raise_info" | "bonus_info">,
    dispatch: DispatchPayload,
): ImportJob {
    return {
        no,
        sourceFile,
        job: {
            ...payload,
            job_code: `D260626-${no}`,
            type: "派遣",
            client_id: null,
            salary_type: "時給制",
            raise_info: null,
            bonus_info: null,
        },
        dispatch,
    };
}

const commonSelection = "職場見学\n入社前オリエンテーション\n就業スタート";
const traffic = "交通費全額支給";

const jobs: ImportJob[] = [
    job("1468", "案件No1468_NTTネクシア_法人営業サポート.pdf", {
        title: "【虎ノ門】法人向け通信サービスの営業サポート｜時給2,100円・土日祝休み",
        area: "東京都 港区",
        search_areas: ["東京都", "港区", "虎ノ門", "虎ノ門ヒルズ"],
        salary: "時給2100円+交通費全額支給",
        category: ["営業"],
        tags: ["高時給", "土日祝休み", "駅チカ", "営業サポート", "交通費全額支給"],
        description: "法人向け音声サービスの営業サポート業務です。各支社の営業担当者が提案前の準備から成約まで進められるよう、相談窓口、代理店訪問、勉強会開催、ターゲット戦略の立案、商談同行、提案書や営業ツール作成支援、案件進捗管理などを担当します。",
        requirements: "法人営業や営業サポートの経験を活かせる業務です。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～17:30",
        holidays: "土日祝休み",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 2100,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "通信サービス関連企業",
        workplace_address: "東京都港区虎ノ門3-8-21 虎ノ門33森ビル9F",
        workplace_access: "虎ノ門ヒルズ・虎ノ門 徒歩3分",
        attire: "男性スーツ着用・女性オフィスカジュアル（要ジャケット）",
        attire_type: "スーツ・オフィスカジュアル",
        hair_style: "オフィスカジュアル",
        nearest_station: "虎ノ門ヒルズ\n虎ノ門",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "法人営業サポート",
        expires_at: null,
    }, {
        client_company_name: "NTTネクシア",
        is_client_company_public: false,
        training_salary: "時給2100円",
        training_period: "現場OJT",
        end_date: "長期",
        actual_work_hours: "7.5時間",
        work_days_per_week: "週5日",
        nail_policy: "オフィスカジュアル",
        shift_notes: "平日固定のため、原則希望休は無し。",
        general_notes: "企業名は公開可否確認まで非公開。外出・商談同行・代理店訪問あり。",
    }),
    job("1464", "案件No1464_渋谷_モバイルバッテリー架電業務.pdf", {
        title: "【渋谷】モバイルバッテリー設置店舗への確認コール｜時給1,550円・服装自由",
        area: "東京都 渋谷区",
        search_areas: ["東京都", "渋谷区", "渋谷"],
        salary: "時給1550円+交通費全額支給",
        category: ["コールセンター"],
        tags: ["時給1550円", "平日勤務", "服装自由", "髪型自由", "駅チカ"],
        description: "モバイルバッテリースタンドを設置している店舗へ電話し、スタンド交換の案内、交換日程の調整、対応可否の確認を行うアウトバウンド業務です。スタンドがオフラインになっている店舗へ状況確認を行い、オンライン接続への対応を依頼・案内します。",
        requirements: "電話対応に抵抗がない方。その他必須条件は求人票に明記なし。",
        working_hours: "9:00～18:00",
        holidays: "基本平日勤務",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1550,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "モバイルバッテリー関連窓口",
        workplace_address: "東京都渋谷区渋谷3-12-18 渋谷南東急ビル3F",
        workplace_access: "渋谷駅 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "渋谷",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "アウトバウンドコール",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "時給1550円",
        training_period: "現場OJT",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "基本平日勤務。",
        general_notes: "架電ノルマ有無は求人票に明記なし。",
    }),
    job("1291", "案件No1291_CDE事務.pdf", {
        title: "【秋葉原】電気・ガス契約のバックオフィス事務｜時給1,500円・交通費全額",
        area: "東京都 千代田区",
        search_areas: ["東京都", "千代田区", "秋葉原", "岩本町"],
        salary: "時給1500円+交通費全額支給",
        category: ["事務"],
        tags: ["事務", "データ入力", "交通費全額支給", "駅チカ", "服装自由"],
        description: "電気・ガスの小売り事業者より受託したお客さまセンターに付随する事務業務です。契約・解約・容量変更案件などのWチェック、連携作業、システム連携、メール連携、電話連絡、各種システム入力、申請業務、社外問い合わせ対応などを担当します。",
        requirements: "PC入力や社内外との連携に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～18:00、10:00～19:00",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1500,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "エネルギー関連バックオフィス",
        workplace_address: "東京都千代田区岩本町2-4-10 小田急神田岩本町ビル6階",
        workplace_access: "秋葉原・岩本町 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由（明るい髪色はNG）",
        nearest_station: "秋葉原\n岩本町",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "バックオフィス事務",
        expires_at: null,
    }, {
        client_company_name: "関西ビジネスインフォメーション",
        is_client_company_public: false,
        training_salary: "時給1500円",
        training_period: "座学研修3～4日程度。研修期間中10日程度は指定シフト、欠勤不可。",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "希望休は月に3回まで。",
        general_notes: "企業名公開可否、電話対応割合は要確認。",
    }),
    job("1290", "案件No1290_CDEWeb受付業務.pdf", {
        title: "【秋葉原】Web申込データの確認・登録事務｜時給1,500円・交通費全額",
        area: "東京都 千代田区",
        search_areas: ["東京都", "千代田区", "秋葉原", "岩本町"],
        salary: "時給1500円+交通費全額支給",
        category: ["事務"],
        tags: ["データ入力", "Excel", "交通費全額支給", "駅チカ", "服装自由"],
        description: "電気・ガスのWeb申込に付随したデータ処理とお客様対応です。Web申込専用フォームから申込データを抽出し、登録情報の確認・修正、顧客システムへのCSV/Excel取り込み、不整合時の架電・受電・メール対応、クライアントへの問い合わせ対応、情報連携などを行います。",
        requirements: "CSV/Excel作業や電話・メール対応に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "平日 9:00～18:00、10:00～19:00／土日祝 9:00～18:00",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1500,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "エネルギー関連Web受付センター",
        workplace_address: "東京都千代田区神田須田町2-8-2 Daiwa神田須田町ビル8階",
        workplace_access: "秋葉原・岩本町 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由（明るい髪色はNG）",
        nearest_station: "秋葉原\n岩本町",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "Web受付・データ処理",
        expires_at: null,
    }, {
        client_company_name: "関西ビジネスインフォメーション",
        is_client_company_public: false,
        training_salary: "時給1500円",
        training_period: "座学、OJTデータ作業、電話対応。約2週間。",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "希望休は月に3回まで。",
        general_notes: "CDE表記の公開置換、電話対応開始時期は要確認。",
    }),
    job("1458", "案件No1458_大井競馬場_キッティング.pdf", {
        title: "スマートフォンの検品・キッティング｜大井競馬場前・時給1,500円・土日祝休み",
        area: "東京都 品川区",
        search_areas: ["東京都", "品川区", "大井競馬場前"],
        salary: "時給1500円+交通費全額支給",
        category: ["製造・軽作業"],
        tags: ["軽作業", "検品", "土日祝休み", "服装自由", "交通費全額支給"],
        description: "中古スマートフォンの開封、付属品確認、機種名・容量・色などのデータ入力、動作チェック、外観チェック、梱包、発送準備を行うキッティング業務です。",
        requirements: "スマートフォンの基本操作や黙々作業に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～18:00",
        holidays: "土日祝休み",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1500,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "スマートフォン検品拠点",
        workplace_address: "大井競馬場",
        workplace_access: "大井競馬場前 徒歩7分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "大井競馬場前",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "キッティング・検品",
        expires_at: null,
    }, {
        client_company_name: "PCSワイヤレス・ジャパン合同会社",
        is_client_company_public: false,
        training_salary: "時給1500円",
        training_period: "現場OJT",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "平日固定のため、原則希望休は無し。",
        general_notes: "重量物有無、座り/立ち作業割合は要確認。",
    }),
    job("1470", "案件No1470_芝浦ふ頭_携帯端末検品業務.pdf", {
        title: "週3日から相談できる携帯端末検品｜芝浦ふ頭・時給1,450円",
        area: "東京都 港区",
        search_areas: ["東京都", "港区", "芝浦ふ頭"],
        salary: "時給1450円+交通費全額支給",
        category: ["製造・軽作業"],
        tags: ["週3日相談可", "検品", "データ入力", "土日祝休み", "交通費全額支給"],
        description: "携帯端末の入庫・検品、初期化、検査、グレーディング、帳票（Excel）へのデータ入力、棚卸を行います。淡々と同じ作業を集中して進める業務です。",
        requirements: "淡々と同じ作業を集中して行える方。携帯端末に興味がある方、キャリアショップなどでの勤務経験があればなお歓迎。",
        working_hours: "9:00～17:30",
        holidays: "土日祝休み",
        benefits: traffic,
        selection_process: "職場見学",
        hourly_wage: 1450,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "携帯端末検品拠点",
        workplace_address: "東京都港区海岸3-30-1 芝浦内資3号上屋2階",
        workplace_access: "芝浦ふ頭 徒歩3分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "芝浦ふ頭",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "携帯端末検品・データ入力",
        expires_at: null,
    }, {
        client_company_name: "PCテクノロジー",
        is_client_company_public: false,
        training_salary: "時給1450円",
        training_period: "現場OJT",
        end_date: "長期",
        actual_work_hours: "7.5時間",
        work_days_per_week: "週3～5日",
        nail_policy: "自由",
        shift_notes: "平日固定のため、原則希望休は無し。",
        general_notes: "基本的に座った状態での黙々作業。週3可の最低曜日数、Excelレベルは要確認。",
    }),
    job("1321", "案件No1321_品川_持続化補助金受付窓口.pdf", {
        title: "補助金申請の受付・事務スタッフ｜品川駅近く・平日17時まで",
        area: "東京都 港区",
        search_areas: ["東京都", "港区", "品川"],
        salary: "時給1460円+交通費全額支給",
        category: ["コールセンター", "事務"],
        tags: ["土日祝休み", "公共系", "問い合わせ受付", "データ入力", "交通費全額支給"],
        description: "補助金申請受付に関する問い合わせ窓口全般業務です。申請に関する疑問点・不明点に電話で回答し、電子システムの操作案内、チェック作業、データ入力などの付随事務も担当します。",
        requirements: "電話対応とPC入力に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～17:00",
        holidays: "土日祝休み",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1460,
        salary_description: traffic,
        period: "長期",
        start_date: "2026年7月1日",
        workplace_name: "補助金申請受付窓口",
        workplace_address: "JR品川駅徒歩約5分。雨天でも駅から傘不要で通れる屋根付き通路あり。",
        workplace_access: "品川 徒歩5分",
        attire: "オフィスカジュアル（ストラップのないサンダル、露出過多やダメージが大きい服装など不可）",
        attire_type: "オフィスカジュアル",
        hair_style: "オフィスカジュアル",
        nearest_station: "品川",
        location_notes: "求人票上の正式な施設名・住所は未記載。",
        commute_allowance: traffic,
        job_category_detail: "補助金申請受付・事務",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "時給1460円",
        training_period: "研修初日10:00～12:30頃（初日のみ初台拠点）。2日目以降9:00～17:00、品川にて実施。",
        end_date: "長期",
        actual_work_hours: "7時間",
        work_days_per_week: "週5日",
        nail_policy: "オフィスカジュアル",
        shift_notes: "平日固定のため原則週5日勤務。希望休なし。",
        general_notes: "求人名の正式名称、募集継続、正式住所は要確認。",
    }),
    job("1022", "案件No1022_渋谷_ヘアケア商品カスタマー窓口.pdf", {
        title: "【渋谷】ヘアケア商品のカスタマー窓口｜時給1,450円・服装自由",
        area: "東京都 渋谷区",
        search_areas: ["東京都", "渋谷区", "渋谷"],
        salary: "時給1450円+交通費全額支給",
        category: ["コールセンター"],
        tags: ["カスタマーサポート", "服装自由", "髪型自由", "ネイル自由", "駅チカ"],
        description: "大手ヘアケア商品のカスタマー窓口業務です。商品の受注対応、定期契約の解約処理、商品説明を中心に、紳士服の問い合わせ業務やゴルフアプリの問い合わせ業務などの付随業務も対応します。オペレーター向けの業務マニュアルがサイト化されています。",
        requirements: "電話対応に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～18:00",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1450,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "渋谷南東急ビル",
        workplace_address: "渋谷南東急ビル",
        workplace_access: "渋谷 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "渋谷",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "カスタマーサポート",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "時給1450円",
        training_period: "1ヶ月ほど研修",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "希望休提出可能。",
        general_notes: "付随業務の比率、土日祝勤務有無は要確認。",
    }),
    job("1435", "案件No1435_新宿_音楽著作権系事務.pdf", {
        title: "【新宿】音楽著作権に関する事務処理｜時給1,423円・土日祝休み",
        area: "東京都 渋谷区",
        search_areas: ["東京都", "渋谷区", "新宿", "南新宿"],
        salary: "時給1423円+交通費全額支給",
        category: ["事務"],
        tags: ["事務", "データ入力", "土日祝休み", "駅チカ", "交通費全額支給"],
        description: "音楽著作権に関する事務処理業務です。書類の開封、仕分け、入力、発送、受信対応、電話リスト作成、申し込み書のデータ入力、一部問い合わせ対応、スキャン、システム登録、印刷、封入、封緘、解約処理などを担当します。",
        requirements: "書類処理やデータ入力に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:25～17:30",
        holidays: "土日祝・年末年始",
        benefits: traffic,
        selection_process: "エントリー",
        hourly_wage: 1423,
        salary_description: traffic,
        period: "長期",
        start_date: "2026年4月15日",
        workplace_name: "フロントプレイス南新宿2F",
        workplace_address: "フロントプレイス南新宿2F",
        workplace_access: "新宿駅 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "新宿",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "音楽著作権関連事務",
        expires_at: null,
    }, {
        client_company_name: "アルティウスリンク",
        is_client_company_public: false,
        training_salary: "時給1423円",
        training_period: "座学5日間、OJT3か月",
        end_date: "長期",
        actual_work_hours: "7時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "1/4、5/1公休。",
        general_notes: "2026年4月15日開始案件の募集継続は要確認。",
    }),
    job("1252", "案件No1252_渋谷_モバイルバッテリーコール業務.pdf", {
        title: "【渋谷】モバイルバッテリーサービスの問合せサポート｜在宅移行予定",
        area: "東京都 渋谷区",
        search_areas: ["東京都", "渋谷区", "渋谷"],
        salary: "時給1450円+交通費全額支給",
        category: ["コールセンター"],
        tags: ["問い合わせ対応", "メール対応", "服装自由", "在宅移行予定", "交通費全額支給"],
        description: "街に設置されているモバイルバッテリーレンタルサービスのサポート業務です。レンタル機を設置している店舗や利用者からの問い合わせに、電話・メールで対応します。OJT期間を含め、在宅勤務までは3か月程度出社勤務を予定しています。",
        requirements: "電話・メール対応に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "15:00～24:00（メイン）。13:00～22:00、14:00～23:00をお願いする場合あり。",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1450,
        salary_description: traffic,
        period: "長期",
        start_date: "即日",
        workplace_name: "モバイルバッテリーサービス窓口",
        workplace_address: "東京都渋谷区渋谷3-12-18 渋谷南東急ビル2F",
        workplace_access: "渋谷 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "渋谷",
        location_notes: "ゆくゆくは在宅勤務予定。条件は要確認。",
        commute_allowance: traffic,
        job_category_detail: "問い合わせサポート",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "変更なし",
        training_period: "OJT研修。最初の1ヶ月は9:00～18:00（平日）勤務。その後、土日祝含むシフト制へ移行の可能性あり。",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "希望休提出可。在宅勤務まではOJT期間含め3か月程度出社予定。",
        general_notes: "夜勤帯の固定度、在宅開始条件、土日祝シフトは要確認。",
    }),
    job("1293", "案件No1293_CDECC.pdf", {
        title: "【秋葉原】電気・ガスのお客様センター受付｜時給1,500円・研修あり",
        area: "東京都 千代田区",
        search_areas: ["東京都", "千代田区", "秋葉原", "岩本町"],
        salary: "時給1500円+交通費全額支給",
        category: ["コールセンター"],
        tags: ["問い合わせ受付", "研修あり", "交通費全額支給", "駅チカ", "服装自由"],
        description: "電気・ガス小売り事業者のお客さまセンターでの入電応対業務です。新規契約、料金比較、キャンペーン、契約内容、請求、会員向けサイトに関する問い合わせ対応のほか、架電対応、問い合わせメール対応、対応履歴作成、契約・解約に伴うシステム入力を行います。",
        requirements: "電話対応に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "平日 8:50～17:50、10:00～19:00／土日祝 8:50～17:50",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1500,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "エネルギー関連お客様センター",
        workplace_address: "東京都千代田区神田須田町2-8-2 Daiwa神田須田町ビル8階",
        workplace_access: "秋葉原・岩本町 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由（明るい髪色はNG）",
        nearest_station: "秋葉原\n岩本町",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "お客様センター受付",
        expires_at: null,
    }, {
        client_company_name: "関西ビジネスインフォメーション",
        is_client_company_public: false,
        training_salary: "時給1500円",
        training_period: "座学、スクリプトを見ながらロープレ、OJT。約2週間。研修期間中は9:00～18:00メイン、10:00～19:00も一部あり。",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "希望休は月に3回まで。",
        general_notes: "インバウンド/架電比率、研修シフトは要確認。",
    }),
    job("505", "案件No505_初台_持続化補助金受付窓口.pdf", {
        title: "【初台】補助金申請の問い合わせ受付｜時給1,500円・土日祝休み",
        area: "東京都 渋谷区",
        search_areas: ["東京都", "渋谷区", "初台"],
        salary: "時給1500円+交通費全額支給",
        category: ["コールセンター", "事務"],
        tags: ["公共系", "問い合わせ受付", "土日祝休み", "データ入力", "交通費全額支給"],
        description: "持続化補助金申込受付に関する問い合わせ窓口です。申込に関する疑問点・不明点への電話回答を中心に、チェック作業、データ入力などの付随する事務軽作業も担当します。",
        requirements: "電話対応とPC入力に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～17:00",
        holidays: "土日祝休み",
        benefits: traffic,
        selection_process: "エントリー\n入社前オリエンテーション\n就業スタート",
        hourly_wage: 1500,
        salary_description: traffic,
        period: "長期",
        start_date: "2026年5月14日",
        workplace_name: "補助金申請受付窓口",
        workplace_address: "東京都渋谷区代々木4-33-10 トーシンビル4F",
        workplace_access: "初台 徒歩5分",
        attire: "オフィスカジュアル（ストラップのないサンダルやジーンズなど不可）",
        attire_type: "オフィスカジュアル",
        hair_style: "オフィスカジュアル",
        nearest_station: "初台",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "補助金申請受付",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "変更なし",
        training_period: "1週間程度（座学・OJT）。研修初日10:00～17:00、2日目以降9:00～17:00。",
        end_date: "長期",
        actual_work_hours: "7時間",
        work_days_per_week: "週5日",
        nail_policy: "オフィスカジュアル",
        shift_notes: "希望休無し。",
        general_notes: "募集継続、品川案件との重複整理は要確認。",
    }),
    job("1465", "案件No1465_相模原市_介護保険窓口.pdf", {
        title: "【相模原】介護保険料に関する問い合わせ受付｜時給1,500円・受電のみ",
        area: "神奈川県 相模原市",
        search_areas: ["神奈川県", "相模原市", "相模原"],
        salary: "時給1500円+交通費全額支給",
        category: ["コールセンター", "医療・介護"],
        tags: ["受電のみ", "問い合わせ受付", "平日勤務", "交通費全額支給", "オフィスカジュアル"],
        description: "介護保険料の納付に関する問い合わせ対応です。介護保険の納入通知書を受け取った方からの電話に対応し、内容の説明や手続き方法の案内を行います。受電のみの業務です。",
        requirements: "電話対応に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:00～18:00",
        holidays: "基本平日勤務",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1500,
        salary_description: traffic,
        period: "長期",
        start_date: "5月27日、6月10日",
        workplace_name: "相模原市介護保険窓口",
        workplace_address: null,
        workplace_access: "相模原 徒歩5分",
        attire: "オフィスカジュアル",
        attire_type: "オフィスカジュアル",
        hair_style: "オフィスカジュアル",
        nearest_station: "相模原",
        location_notes: "求人票上、正式な就業場所住所は空欄。",
        commute_allowance: traffic,
        job_category_detail: "介護保険窓口",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "時給1500円",
        training_period: "現場OJT",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "オフィスカジュアル",
        shift_notes: "基本平日勤務。",
        general_notes: "正式住所、開始日更新、休日表記は要確認。",
    }),
    job("1472", "案件No1472_三田田町_データ入力など.pdf", {
        title: "EC関連商品のデータ集計・事務サポート｜田町・三田エリア・時給1,600円",
        area: "東京都 港区",
        search_areas: ["東京都", "港区", "田町", "三田"],
        salary: "時給1600円+交通費全額支給",
        category: ["事務"],
        tags: ["時給1600円", "データ入力", "Excel", "土日祝休み", "服装自由"],
        description: "EC関連商品のデータ集計、スケジュール調整、受注発注、関連部署との調整、進行管理、その他付随する事務業務を担当します。成人向け商材を扱う部署のため、商材に抵抗がない方向けです。",
        requirements: "成人向け商材に抵抗がない方。PC操作に慣れている方、Excel作業に抵抗がない方、調整業務に必要なコミュニケーションを円滑に取れる方。",
        working_hours: "10:00～19:00",
        holidays: "土日祝日",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1600,
        salary_description: traffic,
        period: "長期",
        start_date: "随時",
        workplace_name: "EC関連事務部門",
        workplace_address: "東京都港区芝5-36-7",
        workplace_access: "田町駅・三田駅 徒歩5分",
        attire: "自由",
        attire_type: "自由",
        hair_style: "自由",
        nearest_station: "田町\n三田",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "データ集計・受発注事務",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "時給1600円",
        training_period: "現場OJT",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週5日",
        nail_policy: "自由",
        shift_notes: "求人票上のシフト備考は0。",
        general_notes: "成人向け商材を扱うため、公開表現と応募前告知の粒度は要確認。",
    }),
    job("1420", "案件No1420_新宿_社内取次業務.pdf", {
        title: "【新宿】社内電話の取次ぎスタッフ｜時給1,600円以上・7月末まで",
        area: "東京都 新宿区",
        search_areas: ["東京都", "新宿区", "新宿"],
        salary: "時給1600～1700円+交通費全額支給",
        category: ["コールセンター", "事務"],
        tags: ["時給1600円以上", "土日祝休み", "電話取次ぎ", "駅チカ", "短期"],
        description: "社内にかかってきた不動産会社・企業担当者からの電話を担当者へ取り次ぐ業務です。取引先への説明対応、内容の案内・回答・判断は行わず、不在時は担当者へ連絡・共有のみ行います。",
        requirements: "電話取次ぎに抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "10:00～18:00",
        holidays: "土日祝休み",
        benefits: traffic,
        selection_process: commonSelection,
        hourly_wage: 1600,
        salary_description: traffic,
        period: "短期",
        start_date: "即日",
        workplace_name: "社内電話取次ぎ窓口",
        workplace_address: "東京都新宿区新宿4-2-18 新宿光風ビル",
        workplace_access: "新宿 徒歩3分",
        attire: "私服",
        attire_type: "私服",
        hair_style: "明るい髪色はNG",
        nearest_station: "新宿",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "電話取次ぎ",
        expires_at: "2026-07-31T14:59:59.000Z",
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "時給1600～1700円",
        training_period: "OJT研修",
        end_date: "2026年7月末まで延長可能",
        actual_work_hours: "7時間",
        work_days_per_week: "週5日",
        nail_policy: "派手でなければ可",
        shift_notes: "平日固定のため、原則希望休は無し。",
        general_notes: "繁忙期は2月・3月。残業は月30時間ほど。",
    }),
    job("1", "案件No1_dカードセンター_コンタクトサポート.pdf", {
        title: "【札幌】dカード関連のコンタクトサポート｜時給1,250円・交通費全額",
        area: "北海道 札幌市",
        search_areas: ["北海道", "札幌市", "札幌", "西15丁目"],
        salary: "時給1250円+交通費全額支給",
        category: ["コールセンター"],
        tags: ["問い合わせ対応", "シフト制", "交通費全額支給", "私服", "札幌"],
        description: "dカードサービス、ドコモの金融商材、その他ドコモサービスに関する問い合わせ・注文などの電話応対業務です。付随する架電対応、専用システムを用いた勧奨業務、顧客情報検索、対応履歴投入、朝礼・ミーティング・研修参加なども含みます。",
        requirements: "電話対応に抵抗がない方。必須条件の詳細は求人票に明記なし。",
        working_hours: "9:45～18:15、10:45～19:15、11:30～20:00",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1250,
        salary_description: traffic,
        period: "長期",
        start_date: "2026年5月7日",
        workplace_name: "dカード関連コンタクトセンター",
        workplace_address: "札幌市中央区北1条西14丁目6番地 NTTドコモ北海道ビル西館3・4・5階",
        workplace_access: "西15丁目 徒歩4分",
        attire: "私服",
        attire_type: "私服",
        hair_style: "私服",
        nearest_station: "西15丁目",
        location_notes: null,
        commute_allowance: traffic,
        job_category_detail: "コンタクトサポート",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "変更なし",
        training_period: "研修期間は平日9:45～17:45。フルスキル研修は2026年4月2日～2026年5月29日予定。",
        end_date: "長期",
        actual_work_hours: "7.5時間",
        work_days_per_week: "週5日",
        nail_policy: "私服",
        shift_notes: "希望休は提出可能。",
        general_notes: "研修日程が過去のため募集継続確認が必要。",
    }),
    job("8", "案件No8_カーシェア車室の巡回作業スタッフ.pdf", {
        title: "カーシェア車室の巡回・設置作業｜札幌エリア・時給1,500円",
        area: "北海道 札幌市",
        search_areas: ["北海道", "札幌市", "東札幌"],
        salary: "時給1500円+交通費全額支給",
        category: ["製造・軽作業"],
        tags: ["時給1500円", "土日祝休み", "外回りあり", "車両回送", "交通費全額支給"],
        description: "カーシェア車室の新設・撤去工事、車両回送、設置物の修繕・交換・清掃などの維持管理、レンタカー繁忙時期の店舗作業応援を行います。路面シール貼り、看板設置、車室計測などの作業があります。",
        requirements: "運転機会が毎日あります。25kg程度の車止めブロックや10kg近いバリアPOP・車室マット設置作業があるため、体力に自信がある方。",
        working_hours: "9:00～17:00",
        holidays: "土日祝",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1500,
        salary_description: traffic,
        period: "短期",
        start_date: "4月以降随時",
        workplace_name: "カーシェア車室巡回拠点",
        workplace_address: "北海道札幌市白石区中央一条2-3-24",
        workplace_access: "東札幌 徒歩13分",
        attire: "オフィスカジュアル",
        attire_type: "オフィスカジュアル",
        hair_style: "オフィスカジュアル",
        nearest_station: "東札幌",
        location_notes: "札幌時計台前店、すすきの中島公園店、新千歳空港店への応援可能性あり。直行直帰可能。",
        commute_allowance: traffic,
        job_category_detail: "巡回・設置作業・車両回送",
        expires_at: "2026-07-31T14:59:59.000Z",
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "変更なし",
        training_period: "OJT研修",
        end_date: "2026年7月31日まで",
        actual_work_hours: "7時間",
        work_days_per_week: "週5日",
        nail_policy: "オフィスカジュアル",
        shift_notes: "平日勤務のため、希望休は要相談。",
        general_notes: "男性が多い職場。短期・屋外作業として確認後に掲載。",
    }),
    job("9", "案件No9_車両回送_洗車業務.pdf", {
        title: "車両回送・洗車スタッフ｜南千歳エリア・週3日から相談可",
        area: "北海道 千歳市",
        search_areas: ["北海道", "千歳市", "南千歳"],
        salary: "時給1250円+交通費全額支給",
        category: ["製造・軽作業"],
        tags: ["週3日相談可", "車両回送", "洗車", "制服貸与", "交通費全額支給"],
        description: "車両回送・洗車業務です。返却された車両の清掃、場内移動、清掃完了車両の車庫格納、返却一時受付（接客あり）を担当します。",
        requirements: "運転免許必須。週3日以上、1日6時間以上から応募可能。",
        working_hours: "9:00～18:00、10:00～19:00。週3日以上、6時間以上から応募可能。",
        holidays: "シフト制",
        benefits: traffic,
        selection_process: null,
        hourly_wage: 1250,
        salary_description: traffic,
        period: "長期",
        start_date: "即日",
        workplace_name: "車両回送・洗車拠点",
        workplace_address: "北海道千歳市柏台南2-1-4",
        workplace_access: "南千歳 徒歩12分",
        attire: "制服貸与",
        attire_type: "制服貸与",
        hair_style: "明るすぎない色",
        nearest_station: "南千歳",
        location_notes: "自動車通勤、自転車、原付での通勤相談可。",
        commute_allowance: traffic,
        job_category_detail: "車両回送・洗車",
        expires_at: null,
    }, {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: "変更なし",
        training_period: "OJT研修",
        end_date: "長期",
        actual_work_hours: "8時間",
        work_days_per_week: "週3～5日",
        nail_policy: "シンプルならOK",
        shift_notes: "希望休は提出可能。",
        general_notes: "運転免許必須。北海道求人の掲載方針がある場合に掲載。",
    }),
];

function getPdfStoragePath(item: ImportJob): string {
    return `${SOURCE_NAME}/${item.job.job_code}.pdf`;
}

function getPublicPdfUrl(item: ImportJob): string {
    const { data } = supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(getPdfStoragePath(item));
    return data.publicUrl;
}

async function attachPdfToJob(jobId: string, item: ImportJob) {
    const localPath = path.join(PDF_SOURCE_DIR, item.sourceFile);
    if (!fs.existsSync(localPath)) {
        throw new Error(`PDF not found: ${localPath}`);
    }

    const stats = fs.statSync(localPath);
    const storagePath = getPdfStoragePath(item);
    const publicUrl = getPublicPdfUrl(item);

    const { data: existingAttachment, error: existingAttachmentError } = await supabase
        .from("job_attachments")
        .select("id")
        .eq("job_id", jobId)
        .eq("file_url", publicUrl)
        .maybeSingle();

    if (existingAttachmentError) {
        throw new Error(`attachment check failed ${item.job.job_code}: ${existingAttachmentError.message}`);
    }

    if (!execute) {
        console.log(`${existingAttachment ? "READY_ATTACHMENT_EXISTS" : "READY_ATTACHMENT"} ${item.job.job_code} ${item.sourceFile}`);
        return { inserted: 0, updatedJob: 0 };
    }

    const fileBody = fs.readFileSync(localPath);
    const { error: uploadError } = await supabase.storage
        .from(DOCUMENT_BUCKET)
        .upload(storagePath, fileBody, {
            contentType: "application/pdf",
            upsert: true,
        });

    if (uploadError) {
        throw new Error(`storage upload failed ${item.job.job_code}: ${uploadError.message}`);
    }

    let inserted = 0;
    if (!existingAttachment) {
        const { error: insertError } = await supabase.from("job_attachments").insert({
            job_id: jobId,
            file_name: item.sourceFile,
            file_url: publicUrl,
            file_type: "application/pdf",
            file_size: stats.size,
        });

        if (insertError) {
            throw new Error(`attachment insert failed ${item.job.job_code}: ${insertError.message}`);
        }
        inserted = 1;
    }

    const { error: updateError } = await supabase
        .from("jobs")
        .update({
            listing_source_url: publicUrl,
            pdf_url: publicUrl,
        })
        .eq("id", jobId);

    if (updateError) {
        throw new Error(`job pdf url update failed ${item.job.job_code}: ${updateError.message}`);
    }

    console.log(`${inserted ? "ATTACH" : "ATTACH_SKIP_EXISTING"} ${item.job.job_code} ${publicUrl}`);
    return { inserted, updatedJob: 1 };
}

async function refreshExistingTitle(jobId: string, currentTitle: string, item: ImportJob) {
    if (currentTitle === item.job.title) {
        if (!execute) console.log(`READY_TITLE_EXISTS ${item.job.job_code}`);
        return 0;
    }

    if (!execute) {
        console.log(`READY_TITLE ${item.job.job_code} ${currentTitle} -> ${item.job.title}`);
        return 0;
    }

    const { error } = await supabase
        .from("jobs")
        .update({ title: item.job.title })
        .eq("id", jobId);

    if (error) {
        throw new Error(`title update failed ${item.job.job_code}: ${error.message}`);
    }

    console.log(`TITLE ${item.job.job_code} ${item.job.title}`);
    return 1;
}

const consultationJobCodes = [
    "D260626-1468",
    "D260626-1291",
    "D260626-1458",
    "D260626-1321",
    "D260626-1464",
    "D260626-1470",
    "D260626-1290",
    "D260626-1022",
];

const consultationHighlightByCode: Record<string, string> = {
    "D260626-1468": "高時給・営業サポート",
    "D260626-1291": "事務・データ入力",
    "D260626-1458": "土日祝休み",
    "D260626-1321": "9時-17時勤務",
    "D260626-1464": "渋谷・服装自由",
    "D260626-1470": "週3日から相談可",
    "D260626-1290": "Web受付・事務",
    "D260626-1022": "カスタマー窓口",
};

async function linkJobsToConsultationDates() {
    const { data: targetJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, job_code")
        .in("job_code", consultationJobCodes);

    if (jobsError) {
        throw new Error(`consultation jobs fetch failed: ${jobsError.message}`);
    }

    const jobByCode = new Map((targetJobs ?? []).map((row) => [row.job_code, row.id]));
    const missingCodes = consultationJobCodes.filter((code) => !jobByCode.has(code));
    if (missingCodes.length > 0) {
        throw new Error(`consultation target jobs missing: ${missingCodes.join(", ")}`);
    }

    const { data: dates, error: datesError } = await supabase
        .from("consultation_available_dates")
        .select("id, available_date, consultation_booking_options(mode, consultation_routes(slug))")
        .eq("status", "available")
        .gte("available_date", CONSULTATION_START_DATE)
        .lte("available_date", CONSULTATION_END_DATE)
        .order("available_date", { ascending: true });

    if (datesError) {
        throw new Error(`consultation dates fetch failed: ${datesError.message}`);
    }

    const targetDates = (dates ?? []).filter((date) => {
        const option = Array.isArray(date.consultation_booking_options)
            ? date.consultation_booking_options[0]
            : date.consultation_booking_options;
        const route = Array.isArray(option?.consultation_routes)
            ? option?.consultation_routes[0]
            : option?.consultation_routes;
        return option?.mode === "visit" && ["dispatch", "undecided"].includes(route?.slug);
    });

    let prepared = 0;
    let written = 0;

    for (const [dateIndex, date] of targetDates.entries()) {
        const option = Array.isArray(date.consultation_booking_options)
            ? date.consultation_booking_options[0]
            : date.consultation_booking_options;
        const route = Array.isArray(option?.consultation_routes)
            ? option?.consultation_routes[0]
            : option?.consultation_routes;
        const routeOffset = route?.slug === "undecided" ? 1 : 0;
        const selectedCodes = Array.from({ length: 4 }, (_, index) => {
            const offset = (dateIndex + routeOffset + index) % consultationJobCodes.length;
            return consultationJobCodes[offset];
        });

        const rows = selectedCodes.map((code, index) => ({
            available_date_id: date.id,
            job_id: jobByCode.get(code),
            display_order: 60 + index * 10,
            highlight_label: consultationHighlightByCode[code],
            is_featured: index === 0,
        }));

        prepared += rows.length;
        if (!execute) {
            console.log(`READY_CONSULTATION_LINK ${date.available_date} ${route?.slug} ${selectedCodes.join(",")}`);
            continue;
        }

        const { error: upsertError } = await supabase
            .from("consultation_date_jobs")
            .upsert(rows, { onConflict: "available_date_id,job_id" });

        if (upsertError) {
            throw new Error(`consultation link upsert failed ${date.available_date}: ${upsertError.message}`);
        }
        written += rows.length;
        console.log(`LINK_CONSULTATION ${date.available_date} ${route?.slug} ${selectedCodes.join(",")}`);
    }

    return { targetDates: targetDates.length, prepared, written };
}

async function run() {
    console.log(`${execute ? "EXECUTE" : "DRY-RUN"} ${SOURCE_NAME}: ${jobs.length} jobs attach_pdfs=${attachPdfs} link_consultation=${linkConsultation} refresh_titles=${refreshTitles}`);

    let created = 0;
    let skipped = 0;
    let failed = 0;
    let attached = 0;
    let pdfUpdatedJobs = 0;
    let refreshedTitles = 0;

    for (const item of jobs) {
        const { data: existing, error: existingError } = await supabase
            .from("jobs")
            .select("id, job_code, title")
            .eq("job_code", item.job.job_code)
            .maybeSingle();

        if (existingError) {
            failed++;
            console.error(`ERROR check ${item.job.job_code}: ${existingError.message}`);
            continue;
        }

        if (existing) {
            skipped++;
            console.log(`SKIP ${item.job.job_code} ${item.job.title}`);
            if (refreshTitles) {
                try {
                    refreshedTitles += await refreshExistingTitle(existing.id, existing.title, item);
                } catch (error) {
                    failed++;
                    console.error(error instanceof Error ? error.message : error);
                }
            }
            if (attachPdfs) {
                try {
                    const result = await attachPdfToJob(existing.id, item);
                    attached += result.inserted;
                    pdfUpdatedJobs += result.updatedJob;
                } catch (error) {
                    failed++;
                    console.error(error instanceof Error ? error.message : error);
                }
            }
            continue;
        }

        if (!execute) {
            console.log(`READY ${item.job.job_code} ${item.job.title}`);
            continue;
        }

        const payload: JobPayload = {
            ...item.job,
            published_at: new Date().toISOString(),
        };

        const { data: newJobId, error } = await supabase.rpc("create_job_with_details", {
            p_job: payload,
            p_dispatch: item.dispatch,
            p_fulltime: null,
        });

        if (error || !newJobId) {
            failed++;
            console.error(`FAIL ${item.job.job_code} ${item.job.title}: ${error?.message || "missing id"}`);
            continue;
        }

        const { error: updateError } = await supabase
            .from("jobs")
            .update({
                listing_source_name: SOURCE_NAME,
                listing_source_url: attachPdfs ? getPublicPdfUrl(item) : item.sourceFile,
                pdf_url: attachPdfs ? getPublicPdfUrl(item) : null,
                nearest_station_is_estimated: false,
            })
            .eq("id", String(newJobId));

        if (updateError) {
            failed++;
            console.error(`FAIL update ${item.job.job_code}: ${updateError.message}`);
            continue;
        }

        created++;
        console.log(`CREATE ${item.job.job_code} ${item.job.title}`);
        if (attachPdfs) {
            try {
                const result = await attachPdfToJob(String(newJobId), item);
                attached += result.inserted;
                pdfUpdatedJobs += result.updatedJob;
            } catch (error) {
                failed++;
                console.error(error instanceof Error ? error.message : error);
            }
        }
    }

    let consultationSummary: { targetDates: number; prepared: number; written: number } | null = null;
    if (linkConsultation) {
        try {
            consultationSummary = await linkJobsToConsultationDates();
        } catch (error) {
            failed++;
            console.error(error instanceof Error ? error.message : error);
        }
    }

    const { count, error: countError } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("listing_source_name", SOURCE_NAME);

    if (countError) {
        console.error(`COUNT error: ${countError.message}`);
    }

    const consultationText = consultationSummary
        ? ` consultation_dates=${consultationSummary.targetDates} consultation_prepared=${consultationSummary.prepared} consultation_written=${consultationSummary.written}`
        : "";
    console.log(`SUMMARY created=${created} skipped=${skipped} failed=${failed} attached=${attached} pdf_updated_jobs=${pdfUpdatedJobs} refreshed_titles=${refreshedTitles} source_count=${count ?? "unknown"}${consultationText}`);
    if (failed > 0) process.exit(1);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
