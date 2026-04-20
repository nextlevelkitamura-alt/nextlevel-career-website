import * as nodemailer from "nodemailer";
import { execSync } from "child_process";

// ============================================================
// 設定
// ============================================================

// SMTP設定
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "e-nextlevel.jp",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS
  tls: { rejectUnauthorized: false }, // 証明書期限切れ対応
  auth: {
    user: process.env.SMTP_USER || "nextlevel-career@e-nextlevel.jp",
    pass: process.env.SMTP_PASS || "",
  },
};

const FROM_ADDRESS = "nextlevel-career@e-nextlevel.jp";
const FROM_NAME = "ネクストレベル キャリア事業部";

// スプレッドシート設定
const SPREADSHEET_ID = "1fddWc665gtF_DTep0eaBFGvssTp-SlLu8MnT8KwZ_bY";
const SHEET_NAME = "企業リスト_メルアド有_大手除外50社";

// テスト送信先（--test モード用）
const TEST_EMAIL = "nextlevel-career@e-nextlevel.jp";

// 送信間隔（ミリ秒）
const SEND_INTERVAL_MS = 3000;

// ============================================================
// メールテンプレート
// ============================================================

function getSubject(companyName: string): string {
  return `【人材紹介のご提案】${companyName}様｜即戦力人材のご紹介について`;
}

function getBody(companyName: string): string {
  return `${companyName}
ご担当者様

突然のご連絡失礼いたします。
株式会社ネクストレベル キャリア事業部の高橋と申します。

貴社の求人情報を拝見し、弊社の人材紹介サービスが
お力になれるのではないかと思い、ご連絡いたしました。

弊社は全国約400万人の登録者を擁する人材サービス会社です。
特に東京都・一都三県エリアの登録者が多く、
即戦力となる経験者人材を迅速にご紹介することが可能です。

■ 弊社の強み
・全国約400万人の豊富な登録者数
・東京都・一都三県エリアに特に強い供給力
・即戦力人材のスピーディーなご紹介

貴社の採用ニーズに合わせて、最適な人材をご提案させていただきます。
まずは情報交換からでも構いませんので、
お気軽にご連絡いただければ幸いです。

何卒よろしくお願いいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
株式会社ネクストレベル　ネクストレベルキャリア
事業副部長　高橋 朝光

〒160-0023
東京都新宿区西新宿3丁目2-7 KDX新宿ビル11F
TEL: 03-5366-8610　FAX: 03-5366-8615
携帯: 080-4334-8411
MAIL: ${FROM_ADDRESS}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ============================================================
// スプレッドシートからデータ取得
// ============================================================

interface Company {
  name: string;
  email: string;
}

function fetchCompanies(): Company[] {
  console.log("📊 スプレッドシートからデータを取得中...");

  const cmd = `gws sheets +read --spreadsheet "${SPREADSHEET_ID}" --range "${SHEET_NAME}!A2:B60"`;
  const result = execSync(cmd, { encoding: "utf-8" });
  const data = JSON.parse(result);

  if (!data.values || data.values.length === 0) {
    throw new Error("スプレッドシートにデータがありません");
  }

  const companies: Company[] = [];
  for (const row of data.values) {
    const email = row[0]?.trim(); // A列: メールアドレス
    const name = row[1]?.trim();  // B列: 企業名
    if (name && email && email.includes("@")) {
      companies.push({ name, email });
    }
  }

  console.log(`✅ ${companies.length}社のデータを取得しました\n`);
  return companies;
}

// ============================================================
// メール送信
// ============================================================

async function sendEmail(
  transporter: nodemailer.Transporter,
  company: Company,
  index: number,
  total: number
): Promise<boolean> {
  const subject = getSubject(company.name);
  const body = getBody(company.name);

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: company.email,
      subject,
      text: body,
    });
    console.log(`✅ [${index + 1}/${total}] ${company.name} (${company.email}) - 送信成功`);
    return true;
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] ${company.name} (${company.email}) - 送信失敗:`, error);
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// メイン処理
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "--help";

  if (mode === "--help") {
    console.log(`
使い方:
  npx ts-node scripts/send-sales-email.ts --dry-run   内容確認（送信しない）
  npx ts-node scripts/send-sales-email.ts --test       自分宛にテスト送信
  npx ts-node scripts/send-sales-email.ts --send       本番送信

環境変数:
  SMTP_HOST   SMTPサーバー名
  SMTP_PORT   ポート番号（デフォルト: 587）
  SMTP_USER   ユーザー名（デフォルト: nextlevel-career@e-nextlevel.jp）
  SMTP_PASS   パスワード
`);
    return;
  }

  const companies = fetchCompanies();

  // ドライラン
  if (mode === "--dry-run") {
    console.log("=== ドライラン（送信しません） ===\n");
    for (let i = 0; i < companies.length; i++) {
      const c = companies[i];
      console.log(`[${i + 1}/${companies.length}] ${c.name}`);
      console.log(`  宛先: ${c.email}`);
      console.log(`  件名: ${getSubject(c.name)}`);
      console.log("");
    }
    console.log(`\n合計: ${companies.length}通`);
    return;
  }

  // SMTP接続確認
  if (SMTP_CONFIG.host.startsWith("TODO") || SMTP_CONFIG.auth.pass.startsWith("TODO")) {
    console.error("❌ SMTP設定が未完了です。環境変数を設定してください:");
    console.error("   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport(SMTP_CONFIG);

  // 接続テスト
  console.log("🔌 SMTP接続テスト中...");
  try {
    await transporter.verify();
    console.log("✅ SMTP接続成功\n");
  } catch (error) {
    console.error("❌ SMTP接続失敗:", error);
    process.exit(1);
  }

  // テスト送信
  if (mode === "--test") {
    console.log(`=== テスト送信（${TEST_EMAIL} 宛） ===\n`);
    const testCompany = companies[0];
    console.log(`テスト企業: ${testCompany.name}`);
    await sendEmail(
      transporter,
      { name: testCompany.name, email: TEST_EMAIL },
      0,
      1
    );
    return;
  }

  // 本番送信
  if (mode === "--send") {
    console.log(`=== 本番送信開始（${companies.length}通） ===\n`);
    console.log(`送信間隔: ${SEND_INTERVAL_MS / 1000}秒\n`);

    let success = 0;
    let fail = 0;

    for (let i = 0; i < companies.length; i++) {
      const result = await sendEmail(transporter, companies[i], i, companies.length);
      if (result) success++;
      else fail++;

      // 最後の1通以外は間隔を空ける
      if (i < companies.length - 1) {
        await sleep(SEND_INTERVAL_MS);
      }
    }

    console.log(`\n=== 送信完了 ===`);
    console.log(`成功: ${success}通`);
    console.log(`失敗: ${fail}通`);
    return;
  }

  console.error(`不明なオプション: ${mode}`);
  console.error("--help で使い方を確認してください");
  process.exit(1);
}

main().catch(console.error);
