"use client";

import { updateInquiryStatus } from "@/app/admin/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function InquiryStatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const handleChange = async (val: string) => {
        setLoading(true);
        setStatus(val); // optimistic update
        const res = await updateInquiryStatus(id, val);
        if (res?.error) {
            alert("更新に失敗しました");
            setStatus(currentStatus); // revert
        }
        setLoading(false);
    };

    const getBadgeColor = (s: string) => {
        switch (s) {
            case "未対応": return "destructive"; // Red
            case "対応中": return "secondary"; // Gray/Blueish
            case "対応済": return "default"; // Black (or Green if customized)
            default: return "outline";
        }
    };

    return (
        <Select value={status} onValueChange={handleChange} disabled={loading}>
            <SelectTrigger className={`w-[110px] h-8 text-xs ${status === "未対応" ? "border-red-200 bg-red-50 text-red-700" :
                    status === "対応済" ? "border-slate-200 bg-slate-50 text-slate-700" : ""
                }`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="未対応">未対応</SelectItem>
                <SelectItem value="対応中">対応中</SelectItem>
                <SelectItem value="対応済">対応済</SelectItem>
            </SelectContent>
        </Select>
    );
}
