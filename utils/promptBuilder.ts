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
- 求職者が最も魅力を感じるメリットをタイトル頭に配置する
- 派遣: 即時メリット（高時給、人気駅、未経験OK等）を強調
- 正社員: 長期メリット（年間休日、残業少、安定性等）を強調
- 【】は最小限にし、自然で魅力的な文体にする
- 具体的なルールは各雇用形態のプロンプトを参照

### description（仕事内容）
- 400〜600文字で記述。架空のスケジュールや1日の流れは絶対に生成しない
- **以下の構造で分かりやすくまとめる**：
  1. 冒頭1〜2文：仕事の概要と対象者（誰向けか、どんな職場か）
  2. ■見出し＋・箇条書き：業務内容を■で分類し、・で具体的に列挙
  3. 末尾1〜2文：働き方の特徴やメリット
- 段落間は必ず空行（\\n\\n）で区切る。行間を広めにとること
- ■や▼は見出しに使い、・は箇条書きに使う
- 例：
  「大手自動車メーカーの迎賓施設にて、国内外のお客様をお迎えする料飲サービスをお任せします。限られた大切なお客様に集中し、一組一組に深く寄り添い、忘れられない体験を創造することが私たちのミッションです。\\n\\n■主な業務内容\\n・メニューの企画など準備段階からの関わり\\n・オーダーメイドのおもてなし提供\\n・国内外VIPへの接遇サービス\\n\\n■こんな方にピッタリ\\n・お客様にもっと深く向き合いたい方\\n・プライベートも大切にしたい方\\n\\n基本出社 ※業務習得後、週3勤務の場合(月)(火)以外の1日の在宅勤務は相談可能」

### area（エリア）
- 都道府県+市区町村をスペース区切り（例: 東京都 大田区）。番地不要

### working_hours（勤務時間）
- **情報は最大2つまで**に簡潔にまとめる。冗長な記載は不可
- **実働時間は自動計算する**: 原文の勤務時間と休憩時間から「実働 = 終了 - 開始 - 休憩」で算出
  - 例: 9:30〜17:30、休憩1時間 → 実働7時間
  - 例: 10:00〜19:00、休憩1時間 → 実働8時間
  - 例: 9:00〜21:00、休憩1.5時間 → 実働10.5時間
- 固定時間の場合: 「{開始時刻}〜{終了時刻}（実働{N}時間）」
  - 例: 「9:30〜17:30（実働7時間）」
- シフト制の場合: 「シフト制 {開始時刻}〜{終了時刻}（実働{N}時間）」
  - 例: 「シフト制 9:00〜21:00（実働8時間）」
- 複数シフトがある場合: 「シフト制 {時間帯1}/{時間帯2}」で最大2パターンまで
  - 例: 「シフト制 8:00〜17:00/13:00〜22:00」
- **含めない情報**: 休憩時間、週休制度、休日情報（それぞれ別フィールドで管理）
- actual_work_hoursにも同じ計算結果の数値を入れる（例：7）

### salary関連
- salary: 給与テキスト（例: 時給1550〜1600円+交通費）
- salary_type: 「月給制」or「時給制」
- hourly_wage: 時給の数値のみ（例: 1400）
- salary_description: 給与補足情報
- raise_info / bonus_info / commute_allowance: 該当情報。なければ空文字

### 勤務条件
- period: 雇用期間（長期、3ヶ月以上等）
- start_date: 開始時期。派遣の場合「面談通過後 即日〜」「面談通過後 随時」等の形式。正社員の場合「即日」「応相談」等

### 勤務先情報
- workplace_name / workplace_address: 勤務先の名称・住所
- nearest_station: **駅名のみ**（例：「外苑前駅」「新宿駅」）。路線名・徒歩時間は含めない
- workplace_access: **駅からのアクセス情報**（例：「外苑前駅より徒歩5分」「新宿駅から徒歩3分（新宿光風ビル）」）。nearest_stationとは別に、アクセス経路・徒歩時間を記載
- location_notes: その他の勤務地に関する補足情報

### 服装・髪型
- attire: 一文で（例: オフィスカジュアル、ネイルOK）
- attire_type: ビジネスカジュアル/自由/スーツ/制服貸与/その他
- hair_style: 「特に指定なし」/「明るい髪はNG」/「その他」から選択。明るさ制限がある場合は「明るい髪はNG」

### job_category_detail
- categoryより詳しい具体的職種名

### 派遣専用項目（typeが派遣/紹介予定派遣の場合のみ抽出）
- client_company_name: 派遣先企業名（内部管理用。非公開）
- workplace_address: 勤務地住所
- workplace_access: アクセス（例：「外苑前駅より徒歩5分」。nearest_stationとは別に記載）
- training_period: 研修期間・内容
- training_salary: 研修中の時給等
- actual_work_hours: **数値のみ**（例：7）← 「時間」は付けない
- work_days_per_week: **数値のみ**（例：5）← 「日」は付けない
- end_date: 日付のみ（例：2026年4月末）← 「（○ヶ月）」などの補足は不要
- nail_policy: ネイルの可否・規定
- shift_notes: シフトに関する備考
- general_notes: その他備考

**重要**: 派遣求人では workplace_name は抽出しない（企業名は非公開のため）。ただし workplace_address と workplace_access は抽出する

### 正社員専用項目（typeが正社員/契約社員の場合のみ抽出）
- company_name: 企業名
- company_address: 本社・勤務先住所
- industry: 業界（IT、メーカー等）
- company_overview: 会社概要（企業のミッション・ビジョン等）
- business_overview: 事業内容・事業概要（何をしている会社か）
- company_size: 従業員数
- established_date: 設立年月（例：2010年4月）
- annual_salary_min: 年収下限（万円、数値のみ）
- annual_salary_max: 年収上限（万円、数値のみ）
- overtime_hours: 月平均残業時間
- annual_holidays: 年間休日数（数値のみ）
- probation_period: 試用期間
- probation_details: 試用期間中の条件
- smoking_policy: 喫煙環境（屋内禁煙、分煙、喫煙所あり等）
- appeal_points: 仕事の魅力・やりがい
- welcome_requirements: 歓迎スキル・経験
- department_details: 配属部署・チームの詳細
- education_training: 教育制度・研修制度の情報。eラーニング、OJT、資格取得支援、メンター制度等を改行区切りの箇条書きで記載。原文に記載がなければ空文字
- representative: 代表者名（例：代表取締役社長 山田太郎）。原文に記載がなければ空文字
- capital: 資本金（例：1億円、5000万円）。原文に記載がなければ空文字
- work_location_detail: 勤務地のエリア別詳細。全国勤務や複数拠点の場合、エリア別に都道府県を列挙する。改行で区切る
  フォーマット例:
  ◆首都圏エリア\\n東京都、神奈川県、埼玉県、千葉県\\n\\n◆東海エリア\\n愛知県、岐阜県、静岡県、三重県\\n\\n◆関西エリア\\n大阪府、兵庫県、京都府、滋賀県
  ※単一勤務地の場合は空文字
- salary_detail: エリア別の給与詳細（月収例含む）。複数エリアで給与が異なる場合に記載。改行で区切る
  フォーマット例:
  ■首都圏\\n月給25万円〜35万円（月収例30万円〜40万円）\\n\\n■関西\\n月給22万円〜30万円（月収例27万円〜35万円）
  ※エリア別給与がない場合は空文字
- transfer_policy: 転勤の有無・方針（例：転居を伴う転勤なし、全国転勤あり、希望考慮等）。原文に記載がなければ空文字

### 選考プロセス（共通）
- selection_process: 選考の流れを「→」で区切って記載（例：面談 → 書類選考 → 一次面接 → 採用）
- **重要**: 派遣・正社員問わず、ほとんどの求人には「面談」が含まれる。原文に記載がなくても、選考フローに面談を含めること
- 選考ステップの例：面談、書類選考、一次面接、二次面接、最終面接、職場見学、適性検査、内定、採用

## マスタデータ（以下から選択）
holidays: ${masterData.holidays.join(', ')}
  **重要**: 休日・休暇も**必ず1項目ずつ個別に分割**して配列に格納すること
  - ○ 正しい例: ["土日祝", "GW休暇", "夏季休暇", "年末年始休暇"]
  - × 誤った例: ["土日祝・GW休暇・夏季休暇"]
  - 給与/勤務形態に基づく休日パターンのみ（年間休日数は annual_holidays に格納）
benefits: ${masterData.benefits.join(', ')}
  **重要**: 福利厚生は**必ず1項目ずつ個別に分割**して配列に格納すること
  - ○ 正しい例: ["交通費全額支給", "社会保険完備", "研修制度あり", "服装自由", "有給休暇制度"]
  - × 誤った例: ["交通費全額支給 社会保険完備 研修制度あり"]
  - × 誤った例: ["交通費全額支給・社会保険完備・研修制度あり"]
  - 原文が「交通費全額支給、社会保険完備、研修制度あり」のように1つの文にまとまっていても、必ず分割してそれぞれを配列の要素として格納
  - スペース・中黒（・）・読点（、）で区切られている場合も必ず分割
  - 最大8項目まで抽出
requirements: ${masterData.requirements.join(', ')}
  **重要**: 応募資格・条件も**必ず1項目ずつ個別に分割**して配列に格納すること
  - ○ 正しい例: ["未経験OK", "Excel基本操作", "PC基本操作", "高卒以上"]
  - × 誤った例: ["未経験OK Excel基本操作 PC基本操作"]
  - 原文が1文にまとまっていても必ず分割
tags: ${masterData.tags.join(', ')}（2〜3個）

## 出力JSON
{"title":"","area":"","type":"","salary":"","category":"","tags":[],"description":"","requirements":[],"working_hours":"","holidays":[],"benefits":[],"selection_process":"","nearest_station":"","location_notes":"","salary_type":"","raise_info":"","bonus_info":"","commute_allowance":"","job_category_detail":"","hourly_wage":0,"salary_description":"","period":"","workplace_name":"","workplace_address":"","workplace_access":"","attire":"","attire_type":"","hair_style":"","company_name":"","company_address":"","commute_method":"","start_date":"","training_info":"","dress_code":"","work_days":"","contact_person":"","notes":"","client_company_name":"","training_period":"","training_salary":"","actual_work_hours":"","work_days_per_week":"","end_date":"","nail_policy":"","shift_notes":"","general_notes":"","industry":"","company_overview":"","business_overview":"","company_size":"","established_date":"","annual_salary_min":0,"annual_salary_max":0,"overtime_hours":"","annual_holidays":0,"probation_period":"","probation_details":"","smoking_policy":"","appeal_points":"","welcome_requirements":"","department_details":"","education_training":"","representative":"","capital":"","work_location_detail":"","salary_detail":"","transfer_policy":""}

**最終確認**: requirements, holidays, benefits の配列は必ず1項目ずつ分割されていること。スペースや区切り文字で複数項目が1つの文字列になっていないこと。

JSONのみ出力。`;
}

/**
 * Build the user prompt for job extraction (variable per request)
 * Contains mode-specific instructions only.
 */
export function buildExtractionUserPrompt(
    mode: 'standard' | 'anonymous',
    jobType?: string
): string {
    // 派遣社員向けプロンプト
    if (jobType === '派遣' || jobType === '紹介予定派遣') {
        return `以下のPDF/画像から**派遣求人**の情報を抽出してください。

## 派遣求人モード
- typeは「${jobType}」に設定
- **企業名は必ず匿名化**する（「大手メーカー」「IT企業」「外資系金融」等に置換）
- タイトル・説明文でも具体的な企業名は伏せる

### タイトル生成ルール（派遣）
- **即時メリットをタイトル頭に配置**する。求職者が一番知りたい情報を最初に
- 優先順位:
  1. 高時給（1550円以上）→ 「時給1600円！」を頭に。1550未満でも時給は含める
  2. 都心の人気駅（渋谷、新宿、六本木、銀座、表参道、品川等）→ 駅名を含める
  3. わかりやすいメリット → 未経験OK、残業なし、交通費全額、即日スタート、服装自由 等
- 【】は最小限に。自然な文体で魅力を伝える
- 「／」で職種と条件を区切る
- 例:「時給1600円！六本木駅チカの一般事務／未経験OK・土日祝休み」
- 例:「時給1800円！新宿エリアのデータ入力／即日スタート・交通費全額」
- 例:「未経験OK！大手企業でコールセンター／時給1500円・駅徒歩3分」
- 例:「残業なし！渋谷のアパレル事務／時給1550円・服装自由」

### 重点抽出項目（派遣）
1. 時給（hourly_wage）— 数値を正確に
2. 交通費（commute_allowance）— 全額/上限/なし
3. 勤務時間（working_hours）— 「9:30〜17:30（実働7時間）」形式。シフト制なら「シフト制 9:00〜21:00（実働8時間）」。**情報は最大2つ、休憩・休日は含めない**
4. 実働時間（actual_work_hours）— **数値のみ**（例：7）
5. 勤務地（area, nearest_station, location_notes, workplace_address, workplace_access）— エリア、最寄駅、住所、アクセスを抽出。**workplace_name は抽出しない**
6. 服装・髪型・ネイル規定（attire_type, hair_style, nail_policy）
7. 就業開始時期（start_date）— **必ず「面談通過後 即日〜」「面談通過後 随時」の形式で出力**。単に「即日」「随時」とは書かない
8. 勤務期間（period）— 長期/短期
9. 週の出勤日数（work_days_per_week）— **数値のみ**（例：5）
10. 研修期間・研修給与（training_period, training_salary）
11. 契約終了日（end_date）— 日付のみ（例：2026年4月末）← 補足不要
12. 選考プロセス（selection_process）— 「面談 → 採用」など、矢印（→）で区切る。派遣は通常シンプルなフロー

- JSONのみ出力`;
    }

    // 正社員向けプロンプト
    if (jobType === '正社員' || jobType === '契約社員') {
        const isAnonymous = mode === 'anonymous';
        return `以下のPDF/画像から**正社員求人**の情報を抽出してください。

## 正社員求人モード
- typeは「${jobType}」に設定
${isAnonymous
    ? `- **企業名非公開モード**: 企業名は「大手メーカー」「IT企業」「外資系金融」等の抽象表現に置換する
- タイトル・説明文・company_overview・business_overviewでも具体的な企業名は伏せる
- company_url は空文字にする`
    : `- **企業名はそのまま記載**する（匿名化しない）`
}

### タイトル生成ルール（正社員）
- **長期的なメリットをタイトル頭に配置**する。長く働くことへの不安を払拭する情報を最初に
- 優先順位:
  1. ワークライフバランス → 年間休日120日以上、残業月20時間以下、土日祝休み
  2. 年収（高い場合）→ 「年収500万〜！」
  3. 働き方の柔軟性 → リモートワーク可、フレックス制
  4. 安定性・成長性 → 上場企業、設立30年、業界シェアNo.1
  5. キャリアアップ → 研修制度充実、マネジメント候補、未経験歓迎
- 【】は最小限に。自然な文体で魅力を伝える
- 「／」で職種と企業特徴を区切る
- 例:「年間休日125日！Webエンジニア／成長中SaaS企業でフルリモート」
- 例:「残業月10時間・土日祝休み！法人営業／東証プライム上場メーカー」
- 例:「未経験からキャリアアップ！ITコンサルタント／研修制度充実」
- 例:「年収500万〜！経理マネージャー候補／設立30年の安定企業」

### 重点抽出項目（正社員）
1. 年収レンジ（annual_salary_min, annual_salary_max）— 万円単位
2. 企業名・業界（company_name, industry）
3. 企業概要・事業内容（company_overview, business_overview）
4. 仕事の魅力・やりがい（appeal_points）
5. 残業時間（overtime_hours）— ワークライフバランス
6. 年間休日（annual_holidays）— 120日以上を強調。数値のみ入力
7. 歓迎スキル・経験（welcome_requirements）
8. 試用期間（probation_period, probation_details）
9. 服装・髪型（attire, attire_type, hair_style）— 髪型は「特に指定なし」/「明るい髪はNG」/「その他」から選択
10. 選考プロセス（selection_process）— 「面談 → 書類選考 → 一次面接 → 最終面接 → 内定」など、矢印（→）で区切る
11. 教育制度（education_training）— 研修・eラーニング・資格支援等があれば箇条書きで。なければ空文字
12. 代表者（representative）— 代表取締役等の肩書き+氏名。なければ空文字
13. 資本金（capital）— なければ空文字
14. 勤務地エリア詳細（work_location_detail）— 全国勤務や複数拠点の場合にエリア別記載。単一勤務地なら空文字
15. 給与エリア詳細（salary_detail）— エリア別の給与差がある場合に記載。なければ空文字
16. 転勤の有無（transfer_policy）— 転勤の有無・方針。なければ空文字

### description（仕事内容）の生成ルール補足
- 正社員求人では特に、具体的な仕事例を◆マークで分類し、業務内容を・で箇条書きにすると読みやすい
- 例：
  ＼人気の事務職で安定した働き方を！／\\n\\n【仕事例】\\n◆大手メーカーでの経理事務\\n・仕訳・伝票入力メイン\\n・請求書発行や支払い対応\\n・正社員登用実績あり\\n\\n◆IT企業でのカスタマーサポート\\n・システムの問い合わせ対応\\n・週3〜4日在宅勤務OK

- JSONのみ出力`;
    }

    // 従来のモード（jobType未指定 or その他の雇用形態）
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
