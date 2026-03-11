"use client";

import { LocationData } from "@/utils/types";
import { MapPin, Plus, Trash2 } from "lucide-react";

interface MultiLocationEditorProps {
    locations: LocationData[];
    onChange: (locations: LocationData[]) => void;
}

const emptyLocation: LocationData = {
    area: "",
    search_areas: [],
    nearest_station: "",
    workplace_name: "",
    workplace_address: "",
    workplace_access: "",
    location_notes: "",
};

export default function MultiLocationEditor({ locations, onChange }: MultiLocationEditorProps) {
    const updateLocation = (index: number, field: keyof LocationData, value: string) => {
        const updated = [...locations];
        if (field === "search_areas") {
            updated[index] = { ...updated[index], search_areas: [value] };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        // area と search_areas を同期
        if (field === "area") {
            updated[index] = { ...updated[index], search_areas: [value] };
        }
        onChange(updated);
    };

    const addLocation = () => {
        onChange([...locations, { ...emptyLocation }]);
    };

    const removeLocation = (index: number) => {
        if (locations.length <= 1) return;
        onChange(locations.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                    <span className="font-bold text-blue-600">{locations.length}件</span>の現場 → {locations.length}件の求人を作成します
                </p>
            </div>

            {locations.map((loc, index) => (
                <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold text-slate-700">現場 {index + 1}</span>
                        </div>
                        {locations.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeLocation(index)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                title="この現場を削除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">エリア</label>
                            <input
                                value={loc.area}
                                onChange={(e) => updateLocation(index, "area", e.target.value)}
                                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：東京都 日野市"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">最寄駅</label>
                            <input
                                value={loc.nearest_station}
                                onChange={(e) => updateLocation(index, "nearest_station", e.target.value)}
                                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：豊田駅"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">勤務先名</label>
                        <input
                            value={loc.workplace_name}
                            onChange={(e) => updateLocation(index, "workplace_name", e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：イオンモール多摩平の森"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">アクセス</label>
                            <input
                                value={loc.workplace_access}
                                onChange={(e) => updateLocation(index, "workplace_access", e.target.value)}
                                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：豊田駅から徒歩3分"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">住所</label>
                            <input
                                value={loc.workplace_address}
                                onChange={(e) => updateLocation(index, "workplace_address", e.target.value)}
                                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：東京都日野市多摩平2-4-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">備考</label>
                        <input
                            value={loc.location_notes}
                            onChange={(e) => updateLocation(index, "location_notes", e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：無料バスあり"
                        />
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addLocation}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
                <Plus className="w-4 h-4" />
                現場を追加
            </button>
        </div>
    );
}
