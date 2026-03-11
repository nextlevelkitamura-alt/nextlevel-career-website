/**
 * 最寄駅テキストをパースして駅名配列に分割する共通ユーティリティ
 */

const STATION_SEPARATOR = /[\n/／|｜,，、]+/;

/**
 * 最寄駅テキストを個別駅名の配列に分割（重複除去）
 */
export function parseStationNames(nearestStation: string): string[] {
    return Array.from(
        new Set(
            nearestStation
                .split(STATION_SEPARATOR)
                .map((s) => s.trim())
                .filter(Boolean)
        )
    );
}

/**
 * 最寄駅をカード表示用にフォーマット（最大maxVisible駅、超過分は「他N駅」）
 */
export function formatNearestStation(nearestStation: string, maxVisible = 3): string {
    const stations = parseStationNames(nearestStation);
    if (stations.length <= 1) return nearestStation;

    const visible = stations.slice(0, maxVisible);
    const hiddenCount = stations.length - visible.length;
    return hiddenCount > 0
        ? `${visible.join(" / ")} 他${hiddenCount}駅`
        : visible.join(" / ");
}
