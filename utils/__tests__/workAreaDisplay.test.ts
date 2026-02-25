import { describe, expect, it } from "@jest/globals";
import { buildDisplayAreaText, buildDisplayAreaTextWithAddress, getDisplayAreaPrefectures, normalizePrefecture } from "@/utils/workAreaDisplay";

describe("normalizePrefecture", () => {
  it("都道府県+市区町村から都道府県を正規化できる", () => {
    expect(normalizePrefecture("東京都 渋谷区")).toBe("東京都");
    expect(normalizePrefecture("神奈川県横浜市")).toBe("神奈川県");
  });

  it("表記ゆれを正規化できる", () => {
    expect(normalizePrefecture("東京")).toBe("東京都");
    expect(normalizePrefecture("大阪")).toBe("大阪府");
    expect(normalizePrefecture("都道府県: 千葉")).toBe("千葉県");
  });

  it("判別できない場合はnullを返す", () => {
    expect(normalizePrefecture("渋谷駅")).toBeNull();
    expect(normalizePrefecture(" ")).toBeNull();
    expect(normalizePrefecture(undefined)).toBeNull();
  });
});

describe("buildDisplayAreaText", () => {
  it("単一勤務地は都道府県+市区町村まで表示する", () => {
    const result = buildDisplayAreaText(["東京都 板橋区"]);
    expect(result).toBe("東京都 板橋区");
  });

  it("優先都道府県順に並び替え、重複を除去する", () => {
    const result = buildDisplayAreaText([
      "神奈川県 横浜市",
      "東京都 新宿区",
      "埼玉県 さいたま市",
      "東京都 渋谷区",
    ]);

    expect(result).toBe("東京都 / 神奈川県 / 埼玉県");
  });

  it("4件以上は3件+他Nで表示する", () => {
    const result = buildDisplayAreaText([
      "福岡県 福岡市",
      "千葉県 千葉市",
      "東京都 港区",
      "神奈川県 川崎市",
    ]);

    expect(result).toBe("東京都 / 神奈川県 / 千葉県 他1");
  });

  it("優先外の都道府県は五十音順で並べる", () => {
    const result = buildDisplayAreaText([
      "福岡県 福岡市",
      "北海道 札幌市",
      "京都府 京都市",
    ]);

    expect(result).toBe("京都府 / 福岡県 / 北海道");
  });

  it("オブジェクト形式workAreaからも生成できる", () => {
    const result = buildDisplayAreaText([
      { prefecture: "大阪" },
      { prefecture: "東京" },
      { prefecture: "神奈川県" },
      { city: "千葉県 船橋市" },
    ]);

    expect(result).toBe("東京都 / 大阪府 / 神奈川県 他1");
  });

  it("有効な都道府県がない場合は空文字を返す", () => {
    expect(buildDisplayAreaText(["渋谷駅", "新宿駅"])).toBe("");
    expect(buildDisplayAreaText([])).toBe("");
  });
});

describe("buildDisplayAreaTextWithAddress", () => {
  it("勤務地が都道府県のみでも住所から市区町村を補完できる", () => {
    const result = buildDisplayAreaTextWithAddress(["東京都"], "東京都板橋区南町1-1-1");
    expect(result).toBe("東京都 板橋区");
  });
});

describe("getDisplayAreaPrefectures", () => {
  it("表示順に並んだ都道府県配列を返す", () => {
    const result = getDisplayAreaPrefectures([
      "福岡県 福岡市",
      "神奈川県 横浜市",
      "東京都 渋谷区",
      "埼玉県 さいたま市",
    ]);

    expect(result).toEqual(["東京都", "神奈川県", "埼玉県", "福岡県"]);
  });
});
