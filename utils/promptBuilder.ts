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

## 最重要ルール: PDFの情報のみを使用する

以下のルールは全てのフィールドに適用される絶対ルールです：
- **PDFに記載されていない情報は絶対に追加・創作しない**
- 推測や補完で情報を埋めない。記載がない項目は空文字（""）または空配列（[]）にする
- 「おそらく」「一般的に」等の推測に基づく記載は禁止
- PDFの内容を言い換える際も、元の意味を変えない範囲で行う
- 架空のスケジュール、1日の流れ、架空の社員の声、架空のエピソードは絶対に生成しない
- PDFに書かれていない福利厚生・手当・制度を追加しない
- PDFに書かれていない応募資格・歓迎要件を追加しない
- 企業の評判・口コミ・業界での位置づけなど、PDFに書かれていない外部情報を追加しない

## 文体ルール（エン転職スタイル）

- **箇条書き部分は体言止め**、**説明文は「です・ます」調**を使う。「だ・である」調は使わない
- 数字は**半角**で統一（例: 月給25万円、年間休日120日、残業月10時間）
- 「～」（波ダッシュ）と「／」（スラッシュ）は**全角**を使用
- 記号の使い分け:
  - ■：業務カテゴリ・セクション見出し
  - ・：箇条書きの各項目
  - 【】：サブセクション見出し（控えめに使用）
  - ※：注釈・補足情報・注意事項
  - ★：使わない（控えめな表現を心がける）
- 金額表記: 「月給25万円以上」「月給22万5000円～」のように「万円」単位。カンマ区切り（250,000円）は使わない

## 抽出ルール

### title（求人タイトル）
- **何をする仕事なのか、業務内容が一目で分かる**ようにする
- 「営業事務」「法人営業」「Webエンジニア」「経理」など具体的な職種名を必ず含める
- 派遣: 即時メリット（高時給、人気駅、未経験OK等）を強調
- 正社員: 長期メリット（年間休日、残業少、安定性等）を強調
- 【】は最小限にし、自然で魅力的な文体にする
- 具体的なルールは各雇用形態のプロンプトを参照

### description（仕事内容）
- 400〜600文字で記述
- **PDFに記載された業務内容のみ**で構成する。架空の情報は絶対に追加しない
- **以下の4段階構成で記述する**：
  1. 冒頭1〜2文：仕事の概要（です・ます調で、何をする仕事かを簡潔に）
  2. ■見出し＋・箇条書き：業務内容を■で分類し、・で体言止めの箇条書きで列挙（4〜8項目程度）
  3. （任意）入社後の流れ・キャリアパスがPDFにあれば【入社後は】等の見出しで記載
  4. ※補足・注意事項（PDFに記載がある場合のみ）
- 段落間は必ず空行（\\n\\n）で区切る
- 例：
  「大手自動車メーカーの迎賓施設にて、国内外のお客様をお迎えする料飲サービスをお任せします。\\n\\n■主な業務内容\\n・メニューの企画など準備段階からの関わり\\n・オーダーメイドのおもてなし提供\\n・国内外VIPへの接遇サービス\\n\\n■こんな方にピッタリ\\n・お客様にもっと深く向き合いたい方\\n・プライベートも大切にしたい方\\n\\n※業務習得後、在宅勤務の相談可能」

### area（メインエリア）
- 都道府県+市区町村をスペース区切り（例: 東京都 大田区）。番地不要
- 複数勤務地がある場合は最初の勤務地をareaに設定

### search_areas（勤務地一覧）
- 求人に記載された全ての勤務地を "都道府県 市区町村" 形式の配列で出力
- 例: ["東京都 千代田区", "千葉県 千葉市", "神奈川県 横浜市"]
- 勤務地が1つの場合でも配列にする（例: ["東京都 千代田区"]）
- 「勤務地1」「勤務地2」のような記載、全国募集の場合は各エリアの代表的な市区町村を記載
- 番地は不要

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
- **複数の勤務時間パターンがある場合**: 「{時間帯1} または {時間帯2}」と「または」で区切る
  - 例: 「9:00〜18:00（実働8時間） または 10:00〜19:00（実働8時間）」
  - 例: 「8:30〜17:30（実働8時間） または 9:00〜18:00（実働8時間）」
  - シフト制の場合: 「シフト制 8:00〜17:00 または 13:00〜22:00（実働8時間）」
- **含めない情報**: 休憩時間、週休制度、休日情報（それぞれ別フィールドで管理）
- actual_work_hoursにも同じ計算結果の数値を入れる（例：7）

### salary関連（派遣・紹介予定派遣のみ）
- salary: 給与テキスト（例: 時給1550〜1600円+交通費）
- salary_type: 「月給制」or「時給制」
- hourly_wage: 時給の数値のみ（例: 1400）
- salary_description: 給与補足情報
- **正社員・契約社員の場合**: salary, salary_type, hourly_wage, salary_description は出力不要（空文字/0にする）。代わりに annual_salary_min / annual_salary_max を使用する
- raise_info / bonus_info / commute_allowance: 該当情報。なければ空文字

### 勤務条件
- period: 雇用期間（長期、3ヶ月以上等）
- start_date: 開始時期。派遣の場合「面談通過後 即日〜」「面談通過後 随時」等の形式。正社員の場合「即日」「応相談」等

### 勤務地情報（勤務住所）
- workplace_name: 勤務先の名称（例：「株式会社○○ 本社」「○○支店」）
- workplace_address: **実際に勤務する場所の住所**（勤務住所）。会社の本社住所（company_address）と異なる場合がある。実際の勤務場所を記載する
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
- company_name: 企業名（正式名称）
- company_address: **会社の本社住所**（登記上の所在地）。workplace_address（勤務住所）とは別。本社と勤務地が同じでも必ず記載する
- industry: 業界（IT、メーカー等）
- company_overview: 会社概要（企業のミッション・ビジョン等）
- business_overview: 事業内容・事業概要（何をしている会社か）
- company_size: 従業員数
- established_date: 設立年月（例：2010年4月）
- company_url: 企業ホームページURL。原文に記載があれば抽出。なければ空文字
- annual_salary_min: 年収下限（万円、数値のみ）
- annual_salary_max: 年収上限（万円、数値のみ）
- overtime_hours: 月平均残業時間
- annual_holidays: 年間休日情報。基本は数値（例：120）だが、補足情報がある場合はテキストも可
  - 例: 「120」（数値のみの場合）
  - 例: 「120日（配属先により変更あり）」
  - 例: 「125日以上」
  - 例: 「110〜120日（勤務地による）」
- probation_period: 試用期間
- probation_details: 試用期間中の条件
- smoking_policy: 喫煙環境。以下のいずれかで記載:
  - 「完全禁煙」「屋内禁煙」「屋内原則禁煙（喫煙室あり）」「分煙」「喫煙可」「敷地内禁煙」
  - PDFに喫煙に関する記載があれば**必ず抽出する**こと。「受動喫煙対策あり」「禁煙オフィス」等の記載も該当する
- appeal_points: 仕事の魅力・やりがい
- welcome_requirements: 歓迎スキル・経験を**1項目ずつ配列**で抽出（requirements と同じ形式）
  - ○ 正しい例: ["Excel中級以上", "人材業界の経験"]
  - × 誤った例: "Excel中級以上、人材業界の経験"
- department_details: 配属部署・チームの詳細
- recruitment_background: 募集背景（事業拡大、欠員補充、新規事業立ち上げ等）。原文に記載があれば抽出。なければ空文字
- education_training: 教育制度・研修制度の情報。eラーニング、OJT、資格取得支援、メンター制度等を改行区切りの箇条書きで記載。原文に記載がなければ空文字
- representative: 代表者名（例：代表取締役社長 山田太郎）。原文に記載がなければ空文字
- capital: 資本金（例：1億円、5000万円）。原文に記載がなければ空文字
- work_location_detail: 勤務地の詳細情報。**PDFに記載されている全ての勤務先・就業先情報をそのまま記載する**。省略しない
  - BPO・アウトソーシング・派遣型の場合: 各クライアント先・就業先の名称・所在地・業務内容をそれぞれ記載
  - 全国勤務や複数拠点の場合: エリア別に拠点名・住所を列挙
  - 改行（\\n）で区切り、◆や■で見出しをつけて読みやすくする
  フォーマット例（エリア別）:
  ◆首都圏エリア\\n東京都、神奈川県、埼玉県、千葉県\\n\\n◆東海エリア\\n愛知県、岐阜県、静岡県、三重県
  フォーマット例（BPO・複数就業先）:
  ◆就業先A: 〇〇株式会社（東京都千代田区）\\n・コールセンター業務\\n\\n◆就業先B: △△株式会社（大阪府大阪市）\\n・事務サポート業務\\n\\n◆就業先C: □□銀行（愛知県名古屋市）\\n・窓口対応業務
  ※単一勤務地で補足情報がない場合は空文字
- salary_detail: エリア別の給与詳細（月収例含む）。複数エリアで給与が異なる場合に記載。改行で区切る
  フォーマット例:
  ■首都圏\\n月給25万円〜35万円（月収例30万円〜40万円）\\n\\n■関西\\n月給22万円〜30万円（月収例27万円〜35万円）
  ※エリア別給与がない場合は空文字
- transfer_policy: 転勤の有無・方針（例：転居を伴う転勤なし、全国転勤あり、希望考慮等）。原文に記載がなければ空文字
- salary_example: 年収例。具体的な年収モデルを記載。形式: 「450万円／28歳（入社3年）」のように「金額／年齢（入社年数）」で改行区切り。PDFに記載がなければ空文字
- annual_revenue: 売上高（例：50億円、100億円）。PDFに記載がなければ空文字
- onboarding_process: 入社後の流れ（研修・OJT・配属までのステップ等）。PDFに記載がなければ空文字
- interview_location: 面接地の住所。PDFに記載がなければ空文字

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
  **重要**: 福利厚生は**全ての項目をそのまま1つずつ分けて**配列に格納すること。まとめたり省略したりしない
  - ○ 正しい例: ["交通費全額支給", "社会保険完備", "研修制度あり", "服装自由", "有給休暇制度", "退職金制度", "育児支援制度", "住宅手当"]
  - × 誤った例: ["交通費全額支給 社会保険完備 研修制度あり"]
  - × 誤った例: ["交通費全額支給・社会保険完備・研修制度あり"]
  - 原文が「交通費全額支給、社会保険完備、研修制度あり」のように1つの文にまとまっていても、必ず分割してそれぞれを配列の要素として格納
  - スペース・中黒（・）・読点（、）で区切られている場合も必ず分割
  - **PDFに記載されている福利厚生は全て抽出すること。省略しない**
  - マスタデータに完全一致しない場合でも、最も近い項目を選択するか、原文のまま記載する
requirements: ${masterData.requirements.join(', ')}
  **重要**: 応募資格・条件も**必ず1項目ずつ個別に分割**して配列に格納すること
  - ○ 正しい例: ["未経験OK", "Excel基本操作", "PC基本操作", "高卒以上"]
  - × 誤った例: ["未経験OK Excel基本操作 PC基本操作"]
  - 原文が1文にまとまっていても必ず分割
tags: ${masterData.tags.join(', ')}（2〜3個）

## 出力JSON
{"title":"","area":"","search_areas":[],"type":"","salary":"","category":"","tags":[],"description":"","requirements":[],"working_hours":"","holidays":[],"benefits":[],"selection_process":"","nearest_station":"","location_notes":"","salary_type":"","raise_info":"","bonus_info":"","commute_allowance":"","job_category_detail":"","hourly_wage":0,"salary_description":"","period":"","workplace_name":"","workplace_address":"","workplace_access":"","attire":"","attire_type":"","hair_style":"","company_name":"","company_address":"","start_date":"","client_company_name":"","training_period":"","training_salary":"","actual_work_hours":"","work_days_per_week":"","end_date":"","nail_policy":"","shift_notes":"","general_notes":"","industry":"","company_overview":"","business_overview":"","company_size":"","established_date":"","company_url":"","annual_salary_min":0,"annual_salary_max":0,"overtime_hours":"","annual_holidays":"","probation_period":"","probation_details":"","smoking_policy":"","appeal_points":"","welcome_requirements":[],"department_details":"","recruitment_background":"","education_training":"","representative":"","capital":"","work_location_detail":"","salary_detail":"","transfer_policy":"","salary_example":"","annual_revenue":"","onboarding_process":"","interview_location":""}

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
13. 歓迎要件（welcome_requirements）— あれば1項目ずつ配列で抽出。なければ空配列 []

- JSONのみ出力`;
    }

    // 正社員向けプロンプト
    if (jobType === '正社員' || jobType === '契約社員') {
        return `以下のPDF/画像から**正社員求人**の情報を抽出してください。

## 正社員求人モード
- typeは「${jobType}」に設定
- **企業名はそのまま正確に記載**する（匿名化しない）
- **企業情報は必ず抽出**する。PDFに記載がある場合はもちろん、記載が少ない場合でも読み取れる範囲で最大限抽出すること

### 企業情報の抽出ルール（重要）
- **company_name**: 企業名は正式名称で記載（例：「株式会社〇〇」「〇〇株式会社」）。略称ではなく正式名称を使う
- **industry**: 業界を具体的に記載（例：「IT・Web」「製造業」「人材サービス」「金融」「不動産」等）
- **company_overview**: 企業のミッション・ビジョン・特徴を200〜300文字で記載。PDFから読み取れる企業の強み・特色を盛り込む
- **business_overview**: 事業内容・サービス内容を具体的に記載。何をしている会社かが明確に分かるように
- **company_size**: 従業員数（PDFに記載があれば）
- **established_date**: 設立年月（PDFに記載があれば）
- **company_address**: 会社の本社住所（登記上の所在地）。workplace_addressとは別に必ず抽出する
- **representative**: 代表者名（肩書き+氏名）。PDFに記載があれば必ず抽出
- **capital**: 資本金。PDFに記載があれば必ず抽出
- これらの情報はPDFに記載がない場合のみ空文字にすること。記載がある場合は必ず抽出する

### タイトル生成ルール（正社員）
- **何をする仕事か、具体的な職種名・業務内容を必ず含める**（例：「法人営業」「経理事務」「Webエンジニア」「施工管理」等）
- **長期的なメリットをタイトル頭に配置**する。長く働くことへの不安を払拭する情報を最初に
- 優先順位:
  1. ワークライフバランス → 年間休日120日以上、残業月20時間以下、土日祝休み
  2. 年収（高い場合）→ 「年収500万〜！」
  3. 働き方の柔軟性 → リモートワーク可、フレックス制
  4. 安定性・成長性 → 上場企業、設立30年、業界シェアNo.1
  5. キャリアアップ → 研修制度充実、マネジメント候補、未経験歓迎
- 【】は最小限に。自然な文体で魅力を伝える
- 「／」で職種と企業特徴を区切る
- **タイトルに企業名を含める**（例：「年間休日125日！Webエンジニア／株式会社〇〇でフルリモート」）
- 例:「年間休日125日！Webエンジニア／成長中SaaS企業でフルリモート」
- 例:「残業月10時間・土日祝休み！法人営業／東証プライム上場メーカー」
- 例:「未経験からキャリアアップ！ITコンサルタント／研修制度充実」
- 例:「年収500万〜！経理マネージャー候補／設立30年の安定企業」

### 正社員で不要な項目（出力しない）
- salary, salary_type, hourly_wage, salary_description は**出力不要**（空文字/0にする）
- 正社員の給与表示は annual_salary_min / annual_salary_max から自動生成されるため

### 重点抽出項目（正社員）
1. 年収レンジ（annual_salary_min, annual_salary_max）— 万円単位
2. **企業名・業界（company_name, industry）— 必須。正式名称で記載**
3. **企業概要・事業内容（company_overview, business_overview）— 必須。PDFから読み取れる情報を最大限抽出**
4. **企業HP（company_url）— PDFにURLがあれば必ず抽出**
5. 仕事の魅力・やりがい（appeal_points）
6. 募集背景（recruitment_background）— 事業拡大、欠員補充等。PDFに記載があれば抽出
7. 残業時間（overtime_hours）— ワークライフバランス
8. 年間休日（annual_holidays）— 120日以上を強調。数値のみでもテキスト（「120日（配属先により変更あり）」等）でも可
9. 歓迎スキル・経験（welcome_requirements）
10. 試用期間（probation_period, probation_details）
11. 服装・髪型（attire, attire_type, hair_style）— 髪型は「特に指定なし」/「明るい髪はNG」/「その他」から選択
12. 選考プロセス（selection_process）— 「面談 → 書類選考 → 一次面接 → 最終面接 → 内定」など、矢印（→）で区切る
13. 教育制度（education_training）— 研修・eラーニング・資格支援等があれば箇条書きで。なければ空文字
14. **代表者（representative）— 代表取締役等の肩書き+氏名。PDFに記載があれば必ず抽出**
15. **資本金（capital）— PDFに記載があれば必ず抽出**
16. 勤務地エリア詳細（work_location_detail）— **PDFに記載された全ての勤務先・就業先情報をそのまま記載**。BPO等で複数就業先がある場合は全て列挙する。省略しない
17. **勤務地一覧（search_areas）— 複数勤務地がある場合、全ての勤務地を "都道府県 市区町村" 形式の配列で出力。必ず抽出する**
18. 給与エリア詳細（salary_detail）— エリア別の給与差がある場合に記載。なければ空文字
19. 転勤の有無（transfer_policy）— 転勤の有無・方針。なければ空文字

### description（仕事内容）の生成ルール補足
- 正社員求人では特に、具体的な業務内容を■マークで分類し、・で箇条書きにすると読みやすい
- **企業名を説明文中でも具体的に使用する**（匿名化しない）
- **PDFに記載された業務内容のみ記載する。架空の仕事例・業務内容を追加しない**
- 例：
  株式会社〇〇にて、法人向けの営業活動をお任せします。既存顧客への提案が中心で、飛び込み営業はありません。\\n\\n■主な業務内容\\n・既存クライアントへのルート営業\\n・提案書・見積書の作成\\n・納品スケジュールの調整\\n\\n■入社後の流れ\\n・1ヶ月目：座学研修で商品知識を習得\\n・2ヶ月目以降：先輩との同行営業\\n\\n※年間休日125日、残業月平均10時間以下

### 正社員で追加抽出する項目
20. 年収例（salary_example）— 「450万円／28歳（入社3年）」形式で記載。PDFに記載がある場合のみ
21. 売上高（annual_revenue）— PDFに記載がある場合のみ
22. 入社後の流れ（onboarding_process）— 研修・OJT等。PDFに記載がある場合のみ
23. 面接地（interview_location）— PDFに記載がある場合のみ

- JSONのみ出力`;
    }

    // 従来のモード（jobType未指定 or その他の雇用形態）
    return `以下のPDF/画像から求人情報を抽出し、求職者に魅力的に見える形で最適化してください。

## 通常モード
- **企業名はそのまま正確に記載**する（匿名化しない）
- 企業情報（company_name, industry, company_overview, business_overview等）はPDFから読み取れる範囲で最大限抽出する
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
