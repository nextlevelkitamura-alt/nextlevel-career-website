/**
 * circus CSV → Supabase 一括インポートスクリプト
 * 使い方: npx ts-node --project tsconfig.json -e "require('dotenv').config({path:'.env.local'})" scripts/import-circus-csv.ts [csvファイルパス] [--test]
 * または:  npx tsx scripts/import-circus-csv.ts [csvファイルパス] [--test]
 *
 * --test: 最初の1件だけインポート
 */

import * as fs from "fs";
import * as path from "path";
import { createInterface } from "readline";
import { createClient } from "@supabase/supabase-js";

// 環境変数
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CSV パーサー（大容量対応：行単位ストリーム） ---

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuote && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (ch === "," && !inQuote) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

type Row = Record<string, string>;

async function parseCsvFile(filePath: string): Promise<Row[]> {
    return new Promise((resolve, reject) => {
        const rows: Row[] = [];
        let headers: string[] = [];
        let buffer = "";
        let lineCount = 0;

        const stream = fs.createReadStream(filePath, { encoding: "utf8" });

        stream.on("data", (chunk: string | Buffer) => {
            buffer += chunk.toString();
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const rawLine of lines) {
                lineCount++;
                if (lineCount === 1) {
                    headers = parseCsvLine(rawLine.replace(/\r$/, ""));
                    continue;
                }
                const line = rawLine.replace(/\r$/, "");
                if (!line.trim()) continue;
                const values = parseCsvLine(line);
                const row: Row = {};
                headers.forEach((h, i) => {
                    row[h] = (values[i] ?? "").trim();
                });
                if (row["求人名"]?.trim()) rows.push(row);
            }
        });

        stream.on("end", () => {
            if (buffer.trim()) {
                const values = parseCsvLine(buffer.replace(/\r$/, ""));
                const row: Row = {};
                headers.forEach((h, i) => {
                    row[h] = (values[i] ?? "").trim();
                });
                if (row["求人名"]?.trim()) rows.push(row);
            }
            resolve(rows);
        });

        stream.on("error", reject);
    });
}

// --- 列マッピング ---

function buildSalary(row: Row): string {
    const min = parseInt(row["想定年収下限"] || "");
    const max = parseInt(row["想定年収上限"] || "");
    if (min && max) return `年収${Math.floor(min / 10000)}万〜${Math.floor(max / 10000)}万円`;
    if (min) return `年収${Math.floor(min / 10000)}万円〜`;
    if (max) return `〜年収${Math.floor(max / 10000)}万円`;
    return row["給与条件について"] || "";
}

function buildWorkingHours(row: Row): string {
    const start = row["始業時間"] || "";
    const end = row["終業時間"] || "";
    if (start && end) return `${start}〜${end}`;
    return row["勤務地・勤務時間について"] || "";
}

function buildHolidays(row: Row): string {
    return [row["休日"], row["その他の休日休暇"], row["休日休暇に関する補足情報"]]
        .filter(Boolean)
        .join("\n");
}

function buildBenefits(row: Row): string {
    return [row["福利厚生・諸手当"], row["その他の福利厚生・諸手当"], row["福利厚生・諸手当に関する補足情報"]]
        .filter(Boolean)
        .join("\n");
}

function buildSelectionProcess(row: Row): string {
    return [row["選考フロー"], row["選考に関する補足情報"]].filter(Boolean).join("\n");
}

function mapRow(row: Row) {
    const area = [row["勤務都道府県"], row["勤務市区町村"]].filter(Boolean).join(" ");
    const annualMin = parseInt(row["想定年収下限"]) || null;
    const annualMax = parseInt(row["想定年収上限"]) || null;

    const jobPayload = {
        title: row["求人名"],
        area,
        search_areas: row["勤務都道府県"] ? [row["勤務都道府県"]] : [],
        type: "正社員",
        salary: buildSalary(row),
        category: row["職種メイン"] ? [row["職種メイン"]] : [],
        tags: [],
        client_id: null,
        description: row["仕事内容・この仕事のミッション"] || null,
        requirements: row["応募時必須条件"] || null,
        working_hours: buildWorkingHours(row) || null,
        holidays: buildHolidays(row) || null,
        benefits: buildBenefits(row) || null,
        selection_process: buildSelectionProcess(row) || null,
        hourly_wage: null,
        salary_description: null,
        period: null,
        start_date: null,
        workplace_name: null,
        workplace_address: [row["勤務都道府県"], row["勤務市区町村"], row["勤務地詳細"]].filter(Boolean).join(" ") || null,
        workplace_access: null,
        attire: null,
        attire_type: null,
        hair_style: null,
        nearest_station: null,
        location_notes: null,
        salary_type: null,
        raise_info: null,
        bonus_info: null,
        commute_allowance: null,
        job_category_detail: row["職種サブ"] || null,
        published_at: new Date().toISOString(),
        expires_at: null,
        listing_source_name: "circus",
        listing_source_url: null,
    };

    const dispatchPayload = {
        client_company_name: null,
        is_client_company_public: false,
        training_salary: null,
        training_period: null,
        end_date: null,
        actual_work_hours: null,
        work_days_per_week: null,
        nail_policy: null,
        shift_notes: null,
        general_notes: null,
    };

    const fulltimePayload = {
        company_name: row["企業名"] || null,
        is_company_name_public: true,
        company_address: row["住所"] || null,
        industry: row["業種メイン"] || null,
        company_size: row["従業員数"] || null,
        established_date: row["設立年"] || null,
        company_overview: null,
        business_overview: null,
        annual_salary_min: annualMin,
        annual_salary_max: annualMax,
        overtime_hours: row["月間平均残業時間"] || null,
        annual_holidays: row["年間休日"] || null,
        probation_period: null,
        probation_details: null,
        part_time_available: false,
        smoking_policy: row["受動喫煙対策について"] || null,
        appeal_points: row["PRポイント"] || null,
        welcome_requirements: row["応募時必須条件"] || null,
        department_details: null,
        recruitment_background: row["募集背景"] || null,
        company_url: row["会社HP"] || null,
        education_training: null,
        representative: null,
        capital: row["資本金"] || null,
        work_location_detail: null,
        salary_detail: row["給与条件について"] || null,
        transfer_policy: null,
        salary_example: row["年収例"] || null,
        bonus: null,
        raise: null,
        annual_revenue: null,
        onboarding_process: null,
        interview_location: null,
        salary_breakdown: null,
        shift_notes: null,
    };

    return { jobPayload, dispatchPayload, fulltimePayload };
}

// --- インポート処理 ---

const BATCH_SIZE = 10;

async function importRows(rows: Row[], testMode: boolean) {
    const targets = testMode ? rows.slice(0, 1) : rows;
    console.log(`\n📦 インポート開始: ${targets.length}件 ${testMode ? "（テストモード: 1件）" : ""}`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < targets.length; i++) {
        const row = targets[i];
        const { jobPayload, dispatchPayload, fulltimePayload } = mapRow(row);

        const { data: newJobId, error } = await supabase.rpc("create_job_with_details", {
            p_job: jobPayload,
            p_dispatch: dispatchPayload,
            p_fulltime: fulltimePayload,
        });

        if (error) {
            console.error(`  ❌ [${i + 1}] ${row["求人名"]} — ${error.message}`);
            failed++;
        } else {
            if (newJobId) {
                await supabase.from("jobs").update({ listing_source_name: "circus" }).eq("id", String(newJobId));
            }
            success++;
            if (testMode || i % BATCH_SIZE === 0) {
                console.log(`  ✅ [${i + 1}/${targets.length}] ${row["求人名"]}`);
            }
        }

        // 進捗表示（100件ごと）
        if (!testMode && (i + 1) % 100 === 0) {
            console.log(`  📊 進捗: ${i + 1}/${targets.length} (成功:${success} 失敗:${failed})`);
        }
    }

    console.log(`\n✨ 完了: 成功 ${success}件 / 失敗 ${failed}件`);
}

// --- メイン ---

async function main() {
    const args = process.argv.slice(2);
    const testMode = args.includes("--test");
    const csvPath = args.find((a) => !a.startsWith("--")) ??
        path.join(process.env.HOME!, "Downloads", "【共有用】circus求人データ（indeed等転載可能）2026_04_20 - Indeed転載可能求人.csv");

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ ファイルが見つかりません: ${csvPath}`);
        process.exit(1);
    }

    console.log(`📂 CSVファイル: ${path.basename(csvPath)}`);
    console.log("⏳ CSVパース中（大容量のためしばらかかります）...");

    const rows = await parseCsvFile(csvPath);
    console.log(`✅ ${rows.length}件の求人を読み込みました`);

    await importRows(rows, testMode);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
