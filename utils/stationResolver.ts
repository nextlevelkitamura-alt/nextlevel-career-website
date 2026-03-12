/**
 * Station Resolver - 駅名から都道府県・市区町村を解決するユーティリティ
 *
 * 「就業場所: 各地」パターンで最寄り駅のみ列挙されている場合に、
 * 各駅名から都道府県・市区町村を推定し、LocationData を生成する。
 */

import type { LocationData, ExtractedJobData } from "./types";

// 首都圏・関西圏の主要駅 → 「都道府県 市区町村」マッピング
export const STATION_AREA_MAP: Record<string, string> = {
    // === 東京都 JR中央線 ===
    "東京": "東京都 千代田区",
    "神田": "東京都 千代田区",
    "御茶ノ水": "東京都 千代田区",
    "水道橋": "東京都 千代田区",
    "飯田橋": "東京都 千代田区",
    "市ケ谷": "東京都 千代田区",
    "四ツ谷": "東京都 新宿区",
    "信濃町": "東京都 新宿区",
    "千駄ケ谷": "東京都 渋谷区",
    "代々木": "東京都 渋谷区",
    "新宿": "東京都 新宿区",
    "大久保": "東京都 新宿区",
    "東中野": "東京都 中野区",
    "中野": "東京都 中野区",
    "高円寺": "東京都 杉並区",
    "阿佐ケ谷": "東京都 杉並区",
    "荻窪": "東京都 杉並区",
    "西荻窪": "東京都 杉並区",
    "吉祥寺": "東京都 武蔵野市",
    "三鷹": "東京都 三鷹市",
    "武蔵境": "東京都 武蔵野市",
    "東小金井": "東京都 小金井市",
    "武蔵小金井": "東京都 小金井市",
    "国分寺": "東京都 国分寺市",
    "西国分寺": "東京都 国分寺市",
    "国立": "東京都 国立市",
    "立川": "東京都 立川市",
    "日野": "東京都 日野市",
    "豊田": "東京都 日野市",
    "八王子": "東京都 八王子市",
    "西八王子": "東京都 八王子市",
    "高尾": "東京都 八王子市",

    // === 東京都 JR山手線 ===
    "品川": "東京都 港区",
    "大崎": "東京都 品川区",
    "五反田": "東京都 品川区",
    "目黒": "東京都 品川区",
    "恵比寿": "東京都 渋谷区",
    "渋谷": "東京都 渋谷区",
    "原宿": "東京都 渋谷区",
    "池袋": "東京都 豊島区",
    "大塚": "東京都 豊島区",
    "巣鴨": "東京都 豊島区",
    "駒込": "東京都 豊島区",
    "田端": "東京都 北区",
    "西日暮里": "東京都 荒川区",
    "日暮里": "東京都 荒川区",
    "鶯谷": "東京都 台東区",
    "上野": "東京都 台東区",
    "御徒町": "東京都 台東区",
    "秋葉原": "東京都 千代田区",
    "浜松町": "東京都 港区",
    "田町": "東京都 港区",
    "高輪ゲートウェイ": "東京都 港区",
    "有楽町": "東京都 千代田区",
    "新橋": "東京都 港区",

    // === 東京都 JR総武線 ===
    "両国": "東京都 墨田区",
    "錦糸町": "東京都 墨田区",
    "亀戸": "東京都 江東区",
    "平井": "東京都 江戸川区",
    "新小岩": "東京都 葛飾区",
    "小岩": "東京都 江戸川区",

    // === 東京都 東京メトロ ===
    "表参道": "東京都 港区",
    "六本木": "東京都 港区",
    "赤坂": "東京都 港区",
    "溜池山王": "東京都 千代田区",
    "永田町": "東京都 千代田区",
    "銀座": "東京都 中央区",
    "日本橋": "東京都 中央区",
    "大手町": "東京都 千代田区",
    "九段下": "東京都 千代田区",
    "半蔵門": "東京都 千代田区",
    "青山一丁目": "東京都 港区",
    "外苑前": "東京都 港区",
    "虎ノ門": "東京都 港区",
    "東陽町": "東京都 江東区",
    "豊洲": "東京都 江東区",
    "月島": "東京都 中央区",
    "門前仲町": "東京都 江東区",
    "茅場町": "東京都 中央区",
    "人形町": "東京都 中央区",
    "三越前": "東京都 中央区",
    "後楽園": "東京都 文京区",
    "本郷三丁目": "東京都 文京区",
    "護国寺": "東京都 文京区",
    "赤羽岩淵": "東京都 北区",
    "王子": "東京都 北区",
    "赤羽": "東京都 北区",
    "北千住": "東京都 足立区",
    "綾瀬": "東京都 足立区",
    "西新井": "東京都 足立区",
    "竹ノ塚": "東京都 足立区",

    // === 東京都 西武線 ===
    "ひばりヶ丘": "東京都 西東京市",
    "田無": "東京都 西東京市",
    "小平": "東京都 小平市",
    "所沢": "埼玉県 所沢市",
    "練馬": "東京都 練馬区",
    "石神井公園": "東京都 練馬区",
    "大泉学園": "東京都 練馬区",

    // === 東京都 京王線 ===
    "明大前": "東京都 世田谷区",
    "下北沢": "東京都 世田谷区",
    "調布": "東京都 調布市",
    "府中": "東京都 府中市",
    "聖蹟桜ヶ丘": "東京都 多摩市",
    "多摩センター": "東京都 多摩市",
    "町田": "東京都 町田市",

    // === 東京都 その他 ===
    "自由が丘": "東京都 目黒区",
    "二子玉川": "東京都 世田谷区",
    "三軒茶屋": "東京都 世田谷区",
    "蒲田": "東京都 大田区",
    "大森": "東京都 大田区",
    "北綾瀬": "東京都 足立区",

    // === 神奈川県 ===
    "横浜": "神奈川県 横浜市",
    "川崎": "神奈川県 川崎市",
    "武蔵小杉": "神奈川県 川崎市",
    "溝の口": "神奈川県 川崎市",
    "登戸": "神奈川県 川崎市",
    "新百合ヶ丘": "神奈川県 川崎市",
    "鶴見": "神奈川県 横浜市",
    "新横浜": "神奈川県 横浜市",
    "戸塚": "神奈川県 横浜市",
    "関内": "神奈川県 横浜市",
    "桜木町": "神奈川県 横浜市",
    "みなとみらい": "神奈川県 横浜市",
    "藤沢": "神奈川県 藤沢市",
    "茅ヶ崎": "神奈川県 茅ヶ崎市",
    "平塚": "神奈川県 平塚市",
    "小田原": "神奈川県 小田原市",
    "鎌倉": "神奈川県 鎌倉市",
    "大船": "神奈川県 鎌倉市",
    "逗子": "神奈川県 逗子市",
    "厚木": "神奈川県 厚木市",
    "本厚木": "神奈川県 厚木市",
    "海老名": "神奈川県 海老名市",
    "相模大野": "神奈川県 相模原市",
    "橋本": "神奈川県 相模原市",

    // === 埼玉県 ===
    "大宮": "埼玉県 さいたま市",
    "浦和": "埼玉県 さいたま市",
    "南浦和": "埼玉県 さいたま市",
    "北浦和": "埼玉県 さいたま市",
    "武蔵浦和": "埼玉県 さいたま市",
    "与野": "埼玉県 さいたま市",
    "川口": "埼玉県 川口市",
    "蕨": "埼玉県 蕨市",
    "西川口": "埼玉県 川口市",
    "川越": "埼玉県 川越市",
    "春日部": "埼玉県 春日部市",
    "越谷": "埼玉県 越谷市",
    "越谷レイクタウン": "埼玉県 越谷市",
    "草加": "埼玉県 草加市",
    "朝霞": "埼玉県 朝霞市",
    "志木": "埼玉県 志木市",
    "和光市": "埼玉県 和光市",
    "新座": "埼玉県 新座市",
    "熊谷": "埼玉県 熊谷市",
    "上尾": "埼玉県 上尾市",

    // === 千葉県 ===
    "千葉": "千葉県 千葉市",
    "海浜幕張": "千葉県 千葉市",
    "船橋": "千葉県 船橋市",
    "西船橋": "千葉県 船橋市",
    "津田沼": "千葉県 習志野市",
    "市川": "千葉県 市川市",
    "本八幡": "千葉県 市川市",
    "松戸": "千葉県 松戸市",
    "柏": "千葉県 柏市",
    "流山おおたかの森": "千葉県 流山市",
    "浦安": "千葉県 浦安市",
    "新浦安": "千葉県 浦安市",
    "舞浜": "千葉県 浦安市",

    // === 大阪府 ===
    "大阪": "大阪府 大阪市",
    "梅田": "大阪府 大阪市",
    "難波": "大阪府 大阪市",
    "なんば": "大阪府 大阪市",
    "天王寺": "大阪府 大阪市",
    "新大阪": "大阪府 大阪市",
    "心斎橋": "大阪府 大阪市",
    "本町": "大阪府 大阪市",
    "淀屋橋": "大阪府 大阪市",
    "天満橋": "大阪府 大阪市",
    "京橋": "大阪府 大阪市",
    "堺": "大阪府 堺市",
    "豊中": "大阪府 豊中市",
    "吹田": "大阪府 吹田市",
    "高槻": "大阪府 高槻市",
    "枚方市": "大阪府 枚方市",
    "茨木": "大阪府 茨木市",

    // === 兵庫県 ===
    "三宮": "兵庫県 神戸市",
    "神戸": "兵庫県 神戸市",
    "元町": "兵庫県 神戸市",
    "尼崎": "兵庫県 尼崎市",
    "西宮": "兵庫県 西宮市",
    "姫路": "兵庫県 姫路市",

    // === 京都府 ===
    "京都": "京都府 京都市",
    "烏丸": "京都府 京都市",
    "河原町": "京都府 京都市",
    "四条": "京都府 京都市",

    // === 愛知県 ===
    "名古屋": "愛知県 名古屋市",
    "栄": "愛知県 名古屋市",
    "金山": "愛知県 名古屋市",

    // === 福岡県 ===
    "博多": "福岡県 福岡市",
    "天神": "福岡県 福岡市",
};

/**
 * 駅名を正規化（「駅」を除去、全角半角統一、空白除去）
 */
export function normalizeStationName(name: string): string {
    return name
        .trim()
        .replace(/駅$/, "")
        .replace(/\s+/g, "")
        .replace(/　/g, "");
}

/**
 * 駅名テキストを個別の駅名配列に分割
 * 例: "国分寺、国立、鎌倉（平塚）、新小岩" → ["国分寺", "国立", "鎌倉", "平塚", "新小岩"]
 * 括弧内の駅名も独立した駅として扱う
 */
export function parseStationNames(text: string): string[] {
    // 全角括弧内の駅名を「、」区切りに展開
    const expanded = text
        .replace(/（([^）]+)）/g, "、$1")
        .replace(/\(([^)]+)\)/g, "、$1");

    return expanded
        .split(/[、,\n\r・]+/)
        .map((s) => normalizeStationName(s))
        .filter((s) => s.length > 0);
}

/**
 * 駅名からエリア（都道府県 市区町村）を解決
 * 静的テーブルになければ null を返す
 */
export function resolveStationArea(stationName: string): string | null {
    const normalized = normalizeStationName(stationName);
    return STATION_AREA_MAP[normalized] ?? null;
}

/**
 * 「各地」パターンを検出
 * area が「各地」等で、locations が未生成、かつ nearest_station に複数駅がある場合
 */
export function detectMultiStationPattern(data: ExtractedJobData): boolean {
    const hasNoLocations = !data.locations || data.locations.length === 0;

    // nearest_station に複数駅がある（カンマ・読点・改行区切り）
    const stationText = data.nearest_station || "";
    const stationCount = parseStationNames(stationText).length;
    const hasMultipleStations = stationCount >= 2;

    // 複数駅があれば「各地」キーワード不要で検出する
    return hasNoLocations && hasMultipleStations;
}

/**
 * メインタイトルから駅名/エリア名部分を差し替えて現場別タイトルを生成
 */
export function generateLocationTitle(
    mainTitle: string,
    stationName: string,
    area: string
): string {
    if (!mainTitle) return "";

    // エリアから市区町村名を取得（「東京都 国分寺市」→「国分寺市」）
    const city = area.split(/\s+/)[1] || "";
    // 市区町村名から「市」「区」「町」「村」を除去してコア名を取得
    const cityCore = city.replace(/[市区町村]$/, "");

    // タイトル内の既存の駅名/エリア名パターンを検出して差し替え
    // パターン: 「{エリア名}の」「{エリア名}で」「{駅名}駅」「【駅チカ】{駅名}」
    const locationPatterns = [
        // 「国分寺の」「浦和で」のようなパターン
        /([^\s／/【】!！]+?)(?:の|で|エリア)/,
        // 駅名パターン
        /([^\s／/【】!！]+?)駅/,
    ];

    let replaced = false;
    let result = mainTitle;

    for (const pattern of locationPatterns) {
        const match = mainTitle.match(pattern);
        if (match && match[1]) {
            const originalLocation = match[1];
            // 元の駅名/エリア名がマッピングテーブルにあるか確認
            if (STATION_AREA_MAP[normalizeStationName(originalLocation)] || originalLocation.length <= 6) {
                result = mainTitle.replace(originalLocation, stationName);
                replaced = true;
                break;
            }
        }
    }

    // 差し替えできなかった場合、タイトル末尾にエリア情報を追加
    if (!replaced) {
        // タイトルの「／」前に駅名を挿入するか、末尾に追加
        const slashIndex = mainTitle.indexOf("／");
        if (slashIndex > 0) {
            result = `${mainTitle.slice(0, slashIndex)}（${stationName}エリア）${mainTitle.slice(slashIndex)}`;
        } else {
            result = `${mainTitle}（${stationName}エリア）`;
        }
    }

    return result;
}

/**
 * 駅名配列から LocationData[] を生成
 */
export function buildLocationsFromStations(
    stationNames: string[],
    mainTitle: string,
    workplaceAccessTemplate?: string
): LocationData[] {
    return stationNames.map((name) => {
        const normalized = normalizeStationName(name);
        const area = resolveStationArea(normalized) || "";
        const stationWithSuffix = `${normalized}駅`;
        const accessText = workplaceAccessTemplate
            ? workplaceAccessTemplate.replace(/\{駅名\}/g, normalized)
            : `${stationWithSuffix} 最寄りから5〜10分圏内`;

        return {
            title: generateLocationTitle(mainTitle, normalized, area),
            area,
            search_areas: area ? [area] : [],
            nearest_station: stationWithSuffix,
            workplace_name: "",
            workplace_address: "",
            workplace_access: accessText,
            location_notes: "",
        };
    });
}

/**
 * locations の駅名→エリア整合性を検証・補正
 * 静的テーブルにある駅で、AI出力のエリアが不一致なら上書きする
 */
export function validateAndFixLocations(locations: LocationData[]): LocationData[] {
    return locations.map((loc) => {
        const stationName = normalizeStationName(loc.nearest_station);
        const expectedArea = resolveStationArea(stationName);

        if (expectedArea && loc.area !== expectedArea) {
            return {
                ...loc,
                area: expectedArea,
                search_areas: [expectedArea],
            };
        }

        return loc;
    });
}
