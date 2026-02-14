/**
 * Prompt Builder for AI Job Extraction
 *
 * Separates prompts into system instruction (cacheable) and user prompt (variable).
 * Optimized for token reduction while maintaining extraction quality.
 */

export interface MasterData {
    readonly holidays: readonly string[];
    readonly benefits: readonly string[];
    readonly requirements: readonly string[];
    readonly tags: readonly string[];
}

/**
 * Build the system instruction for job extraction (cacheable by Gemini API)
 * Contains fixed rules that don't change per request.
 */
export function buildExtractionSystemInstruction(masterData: MasterData): string {
    return `あなたはプロの求人コンサルタントAIです。PDF/画像から求人情報をJSON形式で抽出してください。

## 抽出ルール

### title（求人タイトル）
- 時給1,500円以上→「【高時給】」、駅徒歩10分以内→「【駅チカ】」を含める
- 求職者が魅力を感じるタイトルにする

### description（仕事内容）
- 400〜600文字で記述。原文に基づき、やりがい・職場雰囲気・対象者を掘り下げる
- 架空のスケジュールや1日の流れは絶対に生成しない

### area（エリア）
- 都道府県+市区町村をスペース区切り（例: 東京都 大田区）。番地不要

### working_hours（勤務時間）
- 原文の時間をそのまま抽出。6時間超なら「（休憩1時間）」を追記

### salary関連
- salary: 給与テキスト（例: 時給1550〜1600円+交通費）
- salary_type: 「月給制」or「時給制」
- hourly_wage: 時給の数値のみ（例: 1400）
- salary_description: 給与補足情報
- raise_info / bonus_info / commute_allowance: 該当情報。なければ空文字

### 勤務条件
- period: 雇用期間（長期、3ヶ月以上等）
- start_date: 開始時期（即日、随時等）

### 勤務先情報
- workplace_name / workplace_address / workplace_access: 勤務先の名称・住所・アクセス
- nearest_station: 駅名のみ（路線名不要）
- location_notes: 駅からの距離等

### 服装・髪型
- attire: 一文で（例: オフィスカジュアル、ネイルOK）
- attire_type: ビジネスカジュアル/自由/スーツ/制服貸与/その他
- hair_style: 特に指定なし/明るくなければよし/その他

### job_category_detail
- categoryより詳しい具体的職種名

### 派遣専用項目（typeが派遣/紹介予定派遣の場合のみ抽出）
- client_company_name: 派遣先企業名
- training_period: 研修期間・内容
- training_salary: 研修中の時給等
- actual_work_hours: 1日の実働時間
- work_days_per_week: 週の出勤日数
- end_date: 契約終了日
- nail_policy: ネイルの可否・規定
- shift_notes: シフトに関する備考
- general_notes: その他備考

### 正社員専用項目（typeが正社員/契約社員の場合のみ抽出）
- company_name: 企業名
- industry: 業界（IT、メーカー等）
- company_overview: 会社概要
- company_size: 従業員数
- annual_salary_min: 年収下限（万円、数値のみ）
- annual_salary_max: 年収上限（万円、数値のみ）
- overtime_hours: 月平均残業時間
- annual_holidays: 年間休日数（数値のみ）
- probation_period: 試用期間
- probation_details: 試用期間中の条件
- appeal_points: 仕事の魅力・やりがい
- welcome_requirements: 歓迎スキル・経験

## マスタデータ（以下から選択）
holidays: ${masterData.holidays.join(', ')}
benefits: ${masterData.benefits.join(', ')}（最大5つ）
requirements: ${masterData.requirements.join(', ')}
tags: ${masterData.tags.join(', ')}（2〜3個）

## 出力JSON
{"title":"","area":"","type":"","salary":"","category":"","tags":[],"description":"","requirements":[],"working_hours":"","holidays":[],"benefits":[],"selection_process":"","nearest_station":"","location_notes":"","salary_type":"","raise_info":"","bonus_info":"","commute_allowance":"","job_category_detail":"","hourly_wage":0,"salary_description":"","period":"","workplace_name":"","workplace_address":"","workplace_access":"","attire":"","attire_type":"","hair_style":"","company_name":"","commute_method":"","start_date":"","training_info":"","dress_code":"","work_days":"","contact_person":"","notes":"","client_company_name":"","training_period":"","training_salary":"","actual_work_hours":"","work_days_per_week":"","end_date":"","nail_policy":"","shift_notes":"","general_notes":"","industry":"","company_overview":"","company_size":"","annual_salary_min":0,"annual_salary_max":0,"overtime_hours":"","annual_holidays":0,"probation_period":"","probation_details":"","appeal_points":"","welcome_requirements":""}

JSONのみ出力。配列フィールドは配列形式で。`;
}

/**
 * Build the user prompt for job extraction (variable per request)
 * Contains mode-specific instructions only.
 */
export function buildExtractionUserPrompt(mode: 'standard' | 'anonymous'): string {
    if (mode === 'anonymous') {
        return `以下のPDF/画像から求人情報を抽出してください。

## 匿名モード
- 企業名・店舗名・ブランド名は絶対に出力しない
- 「大手通信企業」「業界最大手」等の抽象表現に置換
- タイトル・説明文でも企業名はすべて伏せる
- JSONのみ出力`;
    }

    return `以下のPDF/画像から求人情報を抽出し、求職者に魅力的に見える形で最適化してください。

## 通常モード
- タイトルは【アピールポイント】を含め魅力的に
- 例：「【未経験OK・高時給1500円】大手企業でのコールセンター/土日祝休み」
- JSONのみ出力`;
}

/**
 * Build the complete extraction prompt (for environments where system instruction is not supported)
 * Combines system instruction and user prompt.
 */
export function buildFullExtractionPrompt(mode: 'standard' | 'anonymous', masterData: MasterData): string {
    return buildExtractionUserPrompt(mode) + '\n\n' + buildExtractionSystemInstruction(masterData);
}
