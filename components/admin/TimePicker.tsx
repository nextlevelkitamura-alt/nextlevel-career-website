"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimePickerProps {
    onSetTime: (timeString: string) => void;
}

export default function TimePicker({ onSetTime }: TimePickerProps) {
    // Default 09:00 - 18:00
    const [start, setStart] = useState("09:00");
    const [end, setEnd] = useState("18:00");
    const [breakTime, setBreakTime] = useState("60"); // minutes

    const applyTime = () => {
        // Format: 09:00〜18:00（休憩60分）
        const text = `${start}〜${end}（休憩${breakTime}分）`;
        onSetTime(text);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-2 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">かんたん入力:</span>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="border border-slate-300 rounded px-1 py-0.5 text-sm w-20 bg-white text-slate-900"
                />
                <span className="text-slate-400">〜</span>
                <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="border border-slate-300 rounded px-1 py-0.5 text-sm w-20"
                />
            </div>

            <div className="flex items-center gap-1 ml-2">
                <span className="text-xs text-slate-500">休憩</span>
                <select
                    value={breakTime}
                    onChange={(e) => setBreakTime(e.target.value)}
                    className="border border-slate-300 rounded px-1 py-0.5 text-sm bg-white text-slate-900"
                >
                    <option value="0">なし</option>
                    <option value="45">45分</option>
                    <option value="60">60分</option>
                    <option value="90">90分</option>
                </select>
            </div>

            <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={applyTime}
                className="ml-auto bg-white border border-slate-200 hover:bg-primary-50 hover:text-primary-600 text-xs h-7"
            >
                反映
            </Button>
        </div>
    );
}
