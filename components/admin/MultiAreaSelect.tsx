"use client";

import { useState } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import AreaSelect from "./AreaSelect";

interface MultiAreaSelectProps {
    values: string[];
    stations?: string[];
    onChange: (values: string[]) => void;
    onStationsChange?: (stations: string[]) => void;
}

export default function MultiAreaSelect({ values, stations = [], onChange, onStationsChange }: MultiAreaSelectProps) {
    const [duplicateIndex, setDuplicateIndex] = useState<number | null>(null);
    const [coords, setCoords] = useState<string[]>([]);
    const [coordErrorIndex, setCoordErrorIndex] = useState<number | null>(null);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    const handleAreaChange = (index: number, newValue: string) => {
        // 空文字は許可（選択途中の状態）
        if (newValue && values.some((v, i) => i !== index && v === newValue)) {
            setDuplicateIndex(index);
            setTimeout(() => setDuplicateIndex(null), 3000);
            return;
        }
        setDuplicateIndex(null);
        const updated = [...values];
        updated[index] = newValue;
        onChange(updated);
    };

    const handleStationChange = (index: number, newStation: string) => {
        const updated = [...stations];
        // 配列の長さを合わせる
        while (updated.length <= index) updated.push("");
        updated[index] = newStation;
        onStationsChange?.(updated);
    };

    const handleAdd = () => {
        onChange([...values, ""]);
        onStationsChange?.([...stations, ""]);
    };

    const handleRemove = (index: number) => {
        setDuplicateIndex(null);
        const updated = values.filter((_, i) => i !== index);
        onChange(updated.length === 0 ? [""] : updated);
        const updatedStations = stations.filter((_, i) => i !== index);
        onStationsChange?.(updatedStations.length === 0 ? [""] : updatedStations);
        const updatedCoords = coords.filter((_, i) => i !== index);
        setCoords(updatedCoords.length === 0 ? [""] : updatedCoords);
    };

    const parseLatLng = (value: string): { lat: number; lng: number } | null => {
        const parts = value
            .split(/[,\s]+/)
            .map((part) => part.trim())
            .filter(Boolean);
        if (parts.length !== 2) return null;

        const first = Number(parts[0]);
        const second = Number(parts[1]);
        if (Number.isNaN(first) || Number.isNaN(second)) return null;

        const firstLooksLikeLat = Math.abs(first) <= 90;
        const secondLooksLikeLng = Math.abs(second) <= 180;
        if (firstLooksLikeLat && secondLooksLikeLng) return { lat: first, lng: second };

        const firstLooksLikeLng = Math.abs(first) <= 180;
        const secondLooksLikeLat = Math.abs(second) <= 90;
        if (firstLooksLikeLng && secondLooksLikeLat) return { lat: second, lng: first };

        return null;
    };

    const handleFetchStationByCoords = async (index: number) => {
        const parsed = parseLatLng(coords[index] || "");
        if (!parsed) {
            setCoordErrorIndex(index);
            setTimeout(() => setCoordErrorIndex(null), 3000);
            return;
        }

        setLoadingIndex(index);
        setCoordErrorIndex(null);
        try {
            // HeartRails Geo API: 緯度経度から近隣駅候補を返す
            const url = `https://express.heartrails.com/api/json?method=getStations&x=${parsed.lng}&y=${parsed.lat}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("fetch_failed");

            const json = await response.json();
            const firstStation = json?.response?.station?.[0];
            const stationName = firstStation?.name ? `${firstStation.name}駅` : "";
            if (!stationName) throw new Error("not_found");

            handleStationChange(index, stationName);
        } catch {
            setCoordErrorIndex(index);
            setTimeout(() => setCoordErrorIndex(null), 3000);
        } finally {
            setLoadingIndex(null);
        }
    };

    return (
        <div className="space-y-2">
            {values.map((value, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <AreaSelect value={value} onChange={(v) => handleAreaChange(index, v)} />
                        </div>
                        <div className="w-[180px] flex-shrink-0">
                            <Input
                                value={stations[index] || ""}
                                onChange={(e) => handleStationChange(index, e.target.value)}
                                placeholder="最寄り駅（任意）"
                                className="bg-white border-slate-300 text-sm"
                            />
                        </div>
                        <div className="w-[240px] flex-shrink-0">
                            <div className="flex gap-1.5">
                                <Input
                                    value={coords[index] || ""}
                                    onChange={(e) => {
                                        const updated = [...coords];
                                        while (updated.length <= index) updated.push("");
                                        updated[index] = e.target.value;
                                        setCoords(updated);
                                    }}
                                    placeholder="座標 35.68,139.76"
                                    className="bg-white border-slate-300 text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleFetchStationByCoords(index)}
                                    className="px-2 py-1 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                                    disabled={loadingIndex === index}
                                >
                                    {loadingIndex === index ? "検索中" : "座標検索"}
                                </button>
                            </div>
                        </div>
                        {index === 0 && values.length > 1 && (
                            <span className="w-7 flex-shrink-0" />
                        )}
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="この勤務地を削除"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {duplicateIndex === index && (
                        <p className="flex items-center gap-1 text-xs text-red-500 pl-1">
                            <AlertCircle className="w-3 h-3" />
                            この勤務地は既に追加されています
                        </p>
                    )}
                    {coordErrorIndex === index && (
                        <p className="flex items-center gap-1 text-xs text-amber-600 pl-1">
                            <AlertCircle className="w-3 h-3" />
                            座標から駅を取得できませんでした（手動入力してください）
                        </p>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium py-1.5 px-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
                <Plus className="w-3.5 h-3.5" />
                勤務地を追加
            </button>
        </div>
    );
}
